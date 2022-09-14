drop database temlogicadb;
create database temlogicaDB;
use temlogicaDB;

CREATE TABLE jogador 
( 
 nome CHAR(30),  
 id INT PRIMARY KEY,  
 ano INT
); 

CREATE TABLE partida 
( 
 id INT PRIMARY KEY,  
 tempo_partida INT,  
 data_Hora INT,  
 sucesso INT,  
 fase_Atual INT,  
 id_jogador INT,  
 nome_jogo INT 
); 

CREATE TABLE jogo 
( 
 nome INT PRIMARY KEY,  
 max_fase INT 
); 

CREATE TABLE interacao 
( 
 data_Hora INT,  
 origem INT,  
 destino INT,  
 tipo_ligacao INT,  
 id_partida INT,  
 id INT PRIMARY KEY  
); 

CREATE TABLE atividade 
( 
 codigo INT PRIMARY KEY,  
 email_professor INT,  
 escola INT,  
 turma INT,  
 jogo INT,  
 duracao INT
); 

CREATE TABLE professor 
( 
 email INT PRIMARY KEY,  
 codigo INT
); 

CREATE TABLE session 
( 
 id INT PRIMARY KEY,  
 data_Entrada INT,  
 data_Saida INT,  
 navegador INT,  
 plataforma INT,  
 id_jogador INT,  
 id_atividade INT  
); 

ALTER TABLE partida ADD FOREIGN KEY(id_jogador) REFERENCES jogador (id);
ALTER TABLE partida ADD FOREIGN KEY(nome_jogo) REFERENCES Jogo (nome);
ALTER TABLE interacao ADD FOREIGN KEY(id_partida) REFERENCES partida (id);
ALTER TABLE atividade ADD FOREIGN KEY(email_professor) REFERENCES professor (email);
ALTER TABLE session ADD FOREIGN KEY(id_jogador) REFERENCES jogador (id);
ALTER TABLE session ADD FOREIGN KEY(id_atividade) REFERENCES atividade (codigo);


