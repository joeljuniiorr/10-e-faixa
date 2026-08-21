# 10 e Faixa — Modelo de Dados

## Versão 0.1

O banco de dados inicial do 10 e Faixa será composto pelas seguintes entidades:

### players
Representa os jogadores cadastrados na plataforma.

### groups
Representa os grupos/peladas.

Cada grupo armazena sua configuração de agenda semanal:

- `timezone`: fuso horário usado nos cálculos da agenda
- `weekly_game_day`: dia semanal da partida
- `weekly_game_time`: horário local de início da partida
- `duration_minutes`: duração prevista da partida
- `confirmation_opens_before`: antecedência para abertura das confirmações
- `confirmation_closes_before`: antecedência para encerramento das confirmações
- `results_open_after`: intervalo usado para liberar resultados após a partida
- `evaluation_closes_after`: intervalo usado para encerrar as avaliações

### group_members
Relaciona jogadores aos grupos e define seu papel dentro deles.

## Relacionamento inicial

Um jogador pode participar de vários grupos e um grupo pode possuir vários jogadores.

A relação muitos-para-muitos entre `players` e `groups` é representada pela tabela `group_members`.

`group_members` utiliza uma chave primária composta formada por:

- `group_id`
- `player_id`

Isso impede que um mesmo jogador seja cadastrado duas vezes no mesmo grupo.

O campo `role` define inicialmente dois papéis:

- `admin`
- `member`

O campo `active` permite retirar um jogador do grupo sem apagar seu histórico.

### rounds

Representa cada ocorrência semanal de uma pelada.

Cada rodada pertence a um grupo e armazena os horários que controlam seu ciclo.

Principais informações:

- `group_id`: grupo responsável pela rodada
- `scheduled_at`: início da partida
- `ends_at`: término previsto da partida
- `confirmation_opens_at`: abertura das confirmações
- `confirmation_closes_at`: encerramento das confirmações
- `results_open_at`: liberação do registro de resultados e início das avaliações
- `evaluation_closes_at`: prazo padrão para encerramento das avaliações
- `evaluation_closed_at`: encerramento antecipado opcional das avaliações; permanece nulo enquanto não houver fechamento manual
- `status`: estado administrativo da rodada

Os estados administrativos iniciais são:

- `scheduled`
- `finalized`
- `cancelled`

Estados dependentes de horário, como confirmação aberta ou resultados liberados, devem ser derivados dos horários da rodada em vez de armazenados separadamente.

A combinação de `group_id` e `scheduled_at` deve ser única, impedindo duas rodadas do mesmo grupo no mesmo horário.

A função `ensure_group_active_round` garante a rodada operacional sob demanda quando um integrante abre o aplicativo ou quando o grupo ativo é recarregado. Ela retorna uma rodada existente ou cria a próxima usando a configuração semanal do grupo. A operação é idempotente, e a unicidade de `group_id` com `scheduled_at` protege contra rodadas duplicadas.

### round_confirmations

Armazena a confirmação de presença de um jogador em uma rodada.

Principais informações:

- `round_id`: rodada relacionada
- `player_id`: jogador que respondeu
- `status`: resposta do jogador
- `updated_at`: momento da última atualização

Os valores persistidos de `status` são:

- `inside`
- `outside`

O estado `pending` não é armazenado. A ausência de uma confirmação para o jogador naquela rodada representa uma resposta pendente.

A combinação de `round_id` e `player_id` é a chave primária da tabela. Portanto, cada jogador possui no máximo uma confirmação por rodada.

Enquanto a janela de confirmação estiver aberta, a resposta existente poderá ser atualizada de `inside` para `outside` ou vice-versa.

### round_assignments

Armazena a formação de cada rodada.

Cada registro representa um jogador atribuído a um time e posição naquela rodada.

Principais informações:

- `round_id`: rodada relacionada
- `player_id`: jogador participante
- `team`: time atribuído
- `position`: posição na formação
- `updated_at`: momento da última atualização

Os times iniciais são:

- `blue`
- `black`

As posições iniciais são:

- `line`
- `reserve`
- `goalkeeper`

A combinação de `round_id` e `player_id` forma a chave primária, garantindo que cada jogador possua no máximo uma atribuição por rodada.

A formação pode ser alterada pelo administrador sem criar novos registros para o jogador. Nesse caso, os valores de `team` e/ou `position` são atualizados.

As quantidades específicas de jogadores por time e posição serão tratadas pelas regras da aplicação nesta primeira versão.

### round_results

Armazena o placar final de uma rodada.

Principais informações:

- `round_id`: rodada relacionada e chave primária
- `blue_score`: gols do Time Azul
- `black_score`: gols do Time Preto
- `updated_by`: jogador responsável pela última alteração
- `updated_at`: momento da última atualização

Cada rodada pode possuir no máximo um resultado.

Os placares devem ser números inteiros iguais ou maiores que zero.

O vencedor não é armazenado separadamente. Ele deve ser derivado comparando `blue_score` e `black_score`.

Da mesma forma, vitória, derrota ou empate de cada jogador devem ser derivados a partir do resultado da rodada e da sua atribuição em `round_assignments`.

A ausência de um registro em `round_results` representa uma rodada cujo placar ainda não foi registrado.

O histórico do grupo é derivado das rodadas em `rounds` e de seus placares opcionais em `round_results`, sem duplicar esses dados em outra entidade.

### round_evaluations

Armazena as avaliações feitas entre os participantes de uma rodada.

Principais informações:

- `round_id`: rodada relacionada
- `evaluator_id`: jogador participante que atribuiu a nota
- `evaluated_player_id`: jogador participante que recebeu a nota
- `rating`: nota atribuída
- `created_at`: momento de criação da avaliação
- `updated_at`: momento da última atualização

A combinação de `round_id`, `evaluator_id` e `evaluated_player_id` forma a chave primária composta. Assim, cada avaliador possui no máximo uma avaliação para cada outro jogador na mesma rodada.

Tanto o avaliador quanto o jogador avaliado precisam participar da rodada por meio de registros em `round_assignments`. O avaliador não pode avaliar a si próprio.

As notas variam de 0 a 10 em incrementos de 0,5 e podem ser atualizadas enquanto a janela de avaliação estiver aberta.

Os votos individuais permanecem privados. Depois do encerramento, as médias são disponibilizadas por uma agregação segura, sem expor avaliadores ou notas individuais. A média de um jogador só é apresentada quando ele possui pelo menos três avaliações; abaixo desse limite, apenas a insuficiência da amostra é informada.

O ranking do grupo utiliza somente agregados seguros de `round_evaluations` pertencentes a rodadas com avaliação encerrada. Os votos individuais continuam privados, e o mínimo de três avaliações também se aplica à média pública do ranking.

O encerramento ocorre no prazo definido por `evaluation_closes_at` ou pode ser antecipado por um administrador, registrando o momento em `evaluation_closed_at`. Não há reabertura nessa primeira versão.

## Entidades planejadas para versões futuras

### round_player_stats
Gols, assistências e defesas por jogador e rodada.
