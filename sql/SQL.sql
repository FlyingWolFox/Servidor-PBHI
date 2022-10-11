create database heroku_55518ae5848ddec;
use heroku_55518ae5848ddec;

CREATE TABLE professor 
( 
 codigo VARCHAR(8) NOT NULL UNIQUE,  
 email VARCHAR(50) PRIMARY KEY NOT NULL,  
 nome_professor VARCHAR(45) NOT NULL
);

CREATE TABLE partida 
( 
 id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,  
 tempo_partida INT NOT NULL DEFAULT '0',  
 data_hora timestamp NULL DEFAULT CURRENT_TIMESTAMP,  
 sucesso tinyint NOT NULL DEFAULT '0',  
 fase_atual INT NOT NULL DEFAULT '0',  
 id_jogador INT NOT NULL,  
 nome_jogo VARCHAR(30) DEFAULT NULL
);

CREATE TABLE jogo 
( 
 nome_jogo VARCHAR(30) PRIMARY KEY NOT NULL,  
 max_fase INT
);

CREATE TABLE jogador 
( 
 id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,  
 nome VARCHAR(30) DEFAULT NULL,  
 ano VARCHAR(30) DEFAULT NULL
);

CREATE TABLE `interacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_hora` timestamp NULL DEFAULT NULL,
  `origem` varchar(30) DEFAULT NULL,
  `destino` varchar(30) DEFAULT NULL,
  `nome_jogo` varchar(30) DEFAULT NULL,
  `fase_atual` varchar(30) DEFAULT NULL,
  `no_origem` enum('INÍCIO','FIM','Colocar na Esquerda','Colocar na direita','Colocar na interseção','Não mover','É quadrado?','É círculo?','É retângulo?','É triângulo?','É vermelho?','É amarelo?','É azul?','É pequeno?','É grande?','Tem borda?') DEFAULT NULL,
  `no_destino` enum('INÍCIO','FIM','Colocar na Esquerda','Colocar na direita','Colocar na interseção','Não mover','É quadrado?','É círculo?','É retângulo?','É triângulo?','É vermelho?','É amarelo?','É azul?','É pequeno?','É grande?','Tem borda?') DEFAULT NULL,
  `tipo_ligacao` enum('SIM','NÃO','SEM LIGAÇÃO') DEFAULT NULL,
  `id_jogador` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_jogador_idx` (`id_jogador`),
  CONSTRAINT `id_jogador` FOREIGN KEY (`id_jogador`) REFERENCES `jogador` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE atividade 
( 
 id_atividade VARCHAR(8) PRIMARY KEY NOT NULL,  
 jogo VARCHAR(30) NOT NULL,  
 escola VARCHAR(30) NOT NULL,  
 turma VARCHAR(10) NOT NULL,  
 datah_criacao TIMESTAMP NOT NULL,  
 datah_expiracao TIMESTAMP NOT NULL,  
 professor_nome VARCHAR(45) NOT NULL,  
 professor_email VARCHAR(50) NOT NULL,
 ano VARCHAR(30) NOT NULL,
 comentario VARCHAR(300) 
);

ALTER TABLE partida ADD FOREIGN KEY(id_jogador) REFERENCES jogador (id);
ALTER TABLE partida ADD FOREIGN KEY(nome_jogo) REFERENCES jogo (nome_jogo);
-- ALTER TABLE interacao ADD FOREIGN KEY(id_partida) REFERENCES partida (id);
-- ALTER TABLE interacao ADD FOREIGN KEY(nome_jogo) REFERENCES partida (nome_jogo);
ALTER TABLE atividade ADD FOREIGN KEY(jogo) REFERENCES jogo (nome_jogo);
ALTER TABLE atividade ADD FOREIGN KEY(professor_email) REFERENCES professor (email);
alter table jogo add diretorio varchar(80) NULL;

update jogo set diretorio = "./selecao/jogos/repeticao/index.html" where nome_jogo = 'REPETIÇÃO';
update jogo set diretorio = "./selecao/jogos/completar/index.html" where nome_jogo = 'COMPLETAR';
update jogo set diretorio = "./selecao/jogos/completarnumero/index.html" where nome_jogo = 'COMPLETAR COM NÚMEROS';
update jogo set diretorio = "./selecao/jogos/crie seu padrao/index.html" where nome_jogo = 'CRIE SEU PADRÃO';
update jogo set diretorio = "./selecao/jogos/domino da diferenca/index.html" where nome_jogo = 'DOMINÓ DA DIFERENÇA';
update jogo set diretorio = "./selecao/jogos/grupos/index.html" where nome_jogo = 'GRUPOS';
update jogo set diretorio = "./selecao/jogos/grupos fluxograma/index.html" where nome_jogo = 'FLUXOGRAMA';
update jogo set diretorio = "./selecao/jogos/sequencia numero/index.html" where nome_jogo = 'SEQUÊNCIA DE NÚMEROS';
update jogo set diretorio = "./selecao/jogos/sequencia decrescente/index.html" where nome_jogo = 'SEQUÊNCIA DECRESCENTE';

INSERT INTO jogo (nome_jogo,max_fase) VALUES ('COMPLETAR', '24');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('COMPLETAR COM NÚMEROS','24');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('REPETIÇÃO','17');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('SEQUÊNCIA DE NÚMEROS','24');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('CRIAR PADRÃO','17');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('GRUPOS','40');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('LOGICS','30');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('DOMINÓ DA DIFERENÇA','16');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('FLUXOGRAMA','14');
INSERT INTO jogo (nome_jogo,max_fase) VALUES ('SEQUÊNCIA DECRESCENTE' ,'24');

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` bigint DEFAULT NULL,
  `data` mediumtext,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DELIMITER $$
USE `heroku_55518ae5848ddec`$$
CREATE DEFINER=`root`@`localhost` TRIGGER `sessions_BEFORE_DELETE` BEFORE DELETE ON `sessions` FOR EACH ROW BEGIN
update sessionp 
inner join sessions on sessionp.idsessionP = sessions.session_id
set datah_saida = current_timestamp();

END$$
DELIMITER ;

CREATE TABLE sessionp 
( 
 id varchar(128) PRIMARY KEY NOT NULL ,  
 data_entrada TIMESTAMP NULL DEFAULT  CURRENT_TIMESTAMP,  
 data_saida TIMESTAMP DEFAULT NULL,  
 navegador VARCHAR(30) DEFAULT NULL,  
 plataforma VARCHAR(20) DEFAULT NULL,
 localizacao VARCHAR(45) DEFAULT NULL,  
 id_jogador INT DEFAULT NULL,  
 id_atividade VARCHAR(30) DEFAULT NULL
);

ALTER TABLE sessionp ADD FOREIGN KEY(id_jogador) REFERENCES jogador (id);
ALTER TABLE sessionp ADD FOREIGN KEY(id_atividade) REFERENCES atividade (id_atividade);