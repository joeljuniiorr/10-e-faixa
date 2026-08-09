# 10 e Faixa — Modelo de Dados

## Versão 0.1

O banco de dados inicial do 10 e Faixa será composto pelas seguintes entidades:

### players
Representa os jogadores cadastrados na plataforma.

### groups
Representa os grupos/peladas.

### group_members
Relaciona jogadores aos grupos e define seu papel dentro deles.

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