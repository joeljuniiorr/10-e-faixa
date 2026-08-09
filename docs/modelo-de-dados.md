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