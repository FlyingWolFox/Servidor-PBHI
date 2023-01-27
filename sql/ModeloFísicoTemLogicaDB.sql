CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` bigint DEFAULT NULL,
  `data` mediumtext,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE DEFINER=`root`@`localhost` TRIGGER `sessions_BEFORE_DELETE` BEFORE DELETE ON `sessions` FOR EACH ROW BEGIN
update sessionp 
inner join sessions on sessionp.idsessionP = sessions.session_id
set datah_saida = current_timestamp();
END

CREATE TABLE `sessionp` (
  `idsessionP` varchar(128) NOT NULL,
  `id_jogador` int DEFAULT NULL,
  `browser` varchar(30) DEFAULT NULL,
  `platform` varchar(20) DEFAULT NULL,
  `localizacao` varchar(45) DEFAULT NULL,
  `datah_entrada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `datah_saida` timestamp NULL DEFAULT NULL,
  `id_atividade` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`idsessionP`),
  KEY `id_jogador_idx` (`id_jogador`),
  KEY `id_atividade_idx` (`id_atividade`),
  CONSTRAINT `id_atividade` FOREIGN KEY (`id_atividade`) REFERENCES `atividade` (`id_atividade`),
  CONSTRAINT `id_jogador` FOREIGN KEY (`id_jogador`) REFERENCES `jogador` (`id_jogador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `professor` (
  `codigo` varchar(6) NOT NULL,
  `nome_professor` varchar(45) NOT NULL,
  `email` varchar(30) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `partida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_jogo` varchar(30) NOT NULL,
  `id_jogador` int NOT NULL,
  `tempo_partida` int NOT NULL DEFAULT '0',
  `data_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sucesso` tinyint NOT NULL DEFAULT '0',
  `faseAtual` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `nome_jogo_idx` (`nome_jogo`),
  KEY `id_jogador_idx` (`id_jogador`)
) ENGINE=InnoDB AUTO_INCREMENT=526 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `jogo` (
  `nome_jogo` varchar(30) NOT NULL,
  `nFases` int DEFAULT NULL,
  PRIMARY KEY (`nome_jogo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `jogador` (
  `id_jogador` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) DEFAULT NULL,
  `ano_jogador` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_jogador`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `interacoes` (
  `id_interacoes` int NOT NULL AUTO_INCREMENT,
  `no_origem` enum('INÍCIO','FIM','Colocar na Esquerda','Colocar na direita','Colocar na interseção','Não mover','É quadrado?','É círculo?','É retângulo?','É triângulo?','É vermelho?','É amarelo?','É azul?','É pequeno?','É grande?','Tem borda?') DEFAULT NULL,
  `no_destino` enum('INÍCIO','FIM','Colocar na Esquerda','Colocar na direita','Colocar na interseção','Não mover','É quadrado?','É círculo?','É retângulo?','É triângulo?','É vermelho?','É amarelo?','É azul?','É pequeno?','É grande?','Tem borda?') DEFAULT NULL,
  `tipo_ligacao` enum('SIM','NÃO','SEM LIGAÇÃO') DEFAULT NULL,
  `data_hora` timestamp NULL DEFAULT NULL,
  `id_jogador` int NOT NULL,
  `nome_jogo` varchar(30) NOT NULL,
  `faseAtual` int DEFAULT NULL,
  PRIMARY KEY (`id_interacoes`),
  KEY `id_jogador_idx` (`id_jogador`),
  KEY `nome_jogo_idx` (`nome_jogo`)
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `contato` (
  `nome` varchar(45) NOT NULL,
  `email_contato` varchar(45) NOT NULL,
  `comentario` text,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `atividade` (
  `id_atividade` varchar(8) NOT NULL,
  `professor_nome` varchar(30) NOT NULL,
  `turma` varchar(10) NOT NULL,
  `jogo` varchar(30) NOT NULL,
  `ano` varchar(30) NOT NULL,
  `datah_criacao` timestamp NOT NULL,
  `datah_expiracao` timestamp NOT NULL,
  `professor_email` varchar(30) NOT NULL,
  PRIMARY KEY (`id_atividade`),
  KEY `nome_jogo_idx` (`jogo`),
  KEY `professor_email_idx` (`professor_email`),
  CONSTRAINT `jogo` FOREIGN KEY (`jogo`) REFERENCES `jogo` (`nome_jogo`),
  CONSTRAINT `professor_email` FOREIGN KEY (`professor_email`) REFERENCES `professor` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

-- populando a tabela jogo
	INSERT INTO jogo (nome_jogo,nFases) VALUES ('COMPLETAR', '24');
	INSERT INTO jogo (nome_jogo,nFases) VALUES ('COMPLETAR COM NÚMEROS','24');
	INSERT INTO jogo (nome_jogo,nFases) VALUES ('REPETIÇÃO','17');
	INSERT INTO jogo (nome_jogo,nFases) VALUES ('SEQUÊNCIA DE NÚMEROS','24');
	INSERT INTO jogo (nome_jogo,nFases) VALUES ('CRIAR PADRÃO','17');
    INSERT INTO jogo (nome_jogo,nFases) VALUES ('GRUPOS','40');
    INSERT INTO jogo (nome_jogo,nFases) VALUES ('LOGICS','30');
    INSERT INTO jogo (nome_jogo,nFases) VALUES ('DOMINÓ DA DIFERENÇA','16');
    INSERT INTO jogo (nome_jogo,nFases) VALUES ('FLUXOGRAMA','14');
    INSERT INTO jogo (nome_jogo,nFases) VALUES ('SEQUÊNCIA DECRESCENTE' ,'24');
  