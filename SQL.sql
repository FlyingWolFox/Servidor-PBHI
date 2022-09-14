CREATE TABLE Jogador 
( 
 Nome CHAR(n),  
 ID INT PRIMARY KEY,  
 Ano INT,  
); 

CREATE TABLE Partida 
( 
 ID INT,  
 Tempo_Partida INT,  
 Data_Hora INT,  
 Sucesso INT,  
 Fase_Atual INT,  
 ID_Jogador INT,  
 Nome_Jogo INT,  
); 

CREATE TABLE Jogo 
( 
 Nome INT PRIMARY KEY,  
 Max_Fase INT,  
); 

CREATE TABLE Interação 
( 
 Data_Hora INT,  
 Origem INT,  
 Destino INT,  
 Tipo_Ligacao INT,  
 ID_partida INT,  
 ID INT PRIMARY KEY,  
); 

CREATE TABLE Atividade 
( 
 Codigo INT PRIMARY KEY,  
 Email_Professor INT,  
 Escola INT,  
 Turma INT,  
 Jogo INT,  
 Duracao INT,  
); 

CREATE TABLE Professor 
( 
 Email INT PRIMARY KEY,  
 Codigo INT,  
); 

CREATE TABLE Session 
( 
 ID INT PRIMARY KEY,  
 Data_Entrada INT,  
 Data_Saida INT,  
 Navegador INT,  
 Plataforma INT,  
 ID_Jogador INT,  
 ID_Atividade INT,  
); 

ALTER TABLE Partida ADD FOREIGN KEY(ID_Jogador) REFERENCES Jogador (ID_Jogador)
ALTER TABLE Partida ADD FOREIGN KEY(Nome_Jogo) REFERENCES Jogo (Nome_Jogo)
ALTER TABLE Interação ADD FOREIGN KEY(ID_partida) REFERENCES Partida (ID_partida)
ALTER TABLE Atividade ADD FOREIGN KEY(Email_Professor) REFERENCES Professor (Email_Professor)
ALTER TABLE Session ADD FOREIGN KEY(ID_Jogador) REFERENCES Jogador (ID_Jogador)
ALTER TABLE Session ADD FOREIGN KEY(ID_Atividade) REFERENCES Atividade (ID_Atividade)