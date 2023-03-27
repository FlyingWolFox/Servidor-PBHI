update jogo set diretorio = "./selecao/jogos/crie seu padrao/index.html" where nome_jogo = 'CRIAR PADRÃO';
update jogo set diretorio = "./selecao/jogos/Logix/index.html" where nome_jogo = 'LOGICS';
update jogo set max_fase = 24 where nome_jogo = 'COMPLETAR';
update jogo set max_fase = 24 where nome_jogo = 'COMPLETAR COM NÚMEROS';
update jogo set max_fase = 17 where nome_jogo = 'CRIE SEU PADRÃO';
update jogo set max_fase = 16 where nome_jogo = 'DOMINÓ DA DIFERENÇA';
update jogo set max_fase = 26 where nome_jogo = 'GRUPOS';
update jogo set max_fase = 14 where nome_jogo = 'FLUXOGRAMA';
update jogo set max_fase = 18 where nome_jogo = 'SEQUÊNCIA DE NÚMEROS';
update jogo set max_fase = 18 where nome_jogo = 'SEQUÊNCIA DECRESCENTE';
update jogo set max_fase = 18 where nome_jogo = 'LOGICS';
update jogo set max_fase = 17 where nome_jogo = 'REPETIÇÃO';
update jogo set max_fase = 32 where nome_jogo = 'GRUPOS REGRAS';

ALTER TABLE atividade 
ADD COLUMN fase_inicio VARCHAR(2) NULL DEFAULT '1' AFTER comentario,
ADD COLUMN fase_fim VARCHAR(2) NULL AFTER fase_inicio;
