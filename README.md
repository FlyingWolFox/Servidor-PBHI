# temlogica-server

Respositório de testes do servidor tem logica

Todas as timestamps estão no padrão utc string, caso haja a necessidade de mostrar, implementar no cliente a formatação para o tempo local.

## Instalação

Antes de rodar o servidor pela primeira vez:

- Instale o servidor MySQL (pacote mysql-server no ubuntu/apt-get)
- Faça login no servidor MySQL como root (usando root) e execute:

```sql
source sql/SQL.sql; source sql/Patch das fases + diretorio.sql; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dumb123';
```

- Pegue o arquivo .env: `git show a9f50fe:.env > .env`
- Rode `npm install`

Todos os comandos devem ser executados na raiz do repositório.

## Rodando o servidor

Para rodar o servidor execute `npm start`. O servidor estará disponível em `localhost:3000`.
