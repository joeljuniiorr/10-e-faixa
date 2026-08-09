# 10 e Faixa — Modelo de Dados

## Versão 0.1

O banco de dados inicial do 10 e Faixa será composto pelas seguintes entidades:

### players
Representa os jogadores cadastrados na plataforma.

### groups
Representa os grupos/peladas.

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
- `status`: estado administrativo da rodada

Os estados administrativos iniciais são:

- `scheduled`
- `finalized`
- `cancelled`

Estados dependentes de horário, como confirmação aberta ou resultados liberados, devem ser derivados dos horários da rodada em vez de armazenados separadamente.

A combinação de `group_id` e `scheduled_at` deve ser única, impedindo duas rodadas do mesmo grupo no mesmo horário.

### round_confirmations
Armazena as respostas Dentro/Fora dos jogadores em cada rodada.

### round_assignments
Armazena o time e a posição de cada jogador na rodada.

### round_results
Armazena o placar único da rodada.

## Entidades planejadas para versões futuras

### round_player_stats
Gols, assistências e defesas por jogador e rodada.

### evaluations
Avaliações entre jogadores após cada rodada.