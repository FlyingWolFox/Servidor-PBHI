select count(distinct id_jogador) from partida; 
## a query a seguir retorna o tempo medio que leva pra completar um jogo
select round(avg(tempoTotal)/60,2) as "Tempo Medio[Minutos]" from (select sum(tempo_partida) as tempoTotal from partida join jogador on partida.id_jogador = jogador.id_jogador where nome_jogo = "COMPLETAR" group by partida.id_jogador)nested;

select count(*) from partida where sucesso = 1;
## a query a seguir retorna o tempo medio de cada partida
select avg(tempo_partida) from partida where nome_jogo = "COMPLETAR";
## a query a seguir retorna a taxa de acertos 
select count((case when sucesso = 1 then 1 else null end)) as "acerto", count(*) as total, concat(round((count((case when sucesso = 1 then 1 else null end))/count(*)* 100), 2),'%') as "Taxa de Acerto" from partida where nome_jogo = "COMPLETAR";
## a query a seguir retorna o nome do jogador e o numero de tentativas erradas a partir de 3
select jogador.nome  as "Jogador", count((case when sucesso = 0 then 1 else null end)) as "Tentativas", faseAtual from partida join jogador on partida.id_jogador = jogador.id_jogador where partida.nome_jogo = "COMPLETAR" group by faseAtual, nome having count((case when sucesso = 0 then 1 else null end)) >= 3; 
## a query a seguir retorna o nome do jogador e a quantidade de fases que ele não respondeu de um jogo
select jogador.nome, MAX(faseAtual) as UltimaFase, jogo.nFases as Total, (jogo.nFases) - MAX(faseAtual) as "Não Respondidas" from partida join jogo on partida.nome_jogo = jogo.nome_jogo join jogador on partida.id_jogador = jogador.id_jogador where partida.nome_jogo = "COMPLETAR" group by partida.id_jogador having (jogo.nFases) - MAX(faseAtual) > 0 ;