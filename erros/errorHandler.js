//Descrição: Arquivo responsável por tratar os erros da aplicação.
// E separar a responsabilidade de tratar os erros do arquivo index.js
//Todos os erros são apanhados no bloco tryCatch e são direcionados para cá através da chamada da função next(err) dentro do bloco tryCatch

const AppError = require("./appError.js");
const ValidationError = require("./validationError.js");

const errorHandler = (err, req, res, next) => {
  console.log(err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(err.message);
    }
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err.message);
      }
      if(err.code === 'ER_WARN_DATA_TRUNCATED'){ //erro causado pelo jogo fluxograma com os nodes em tela reduzida, o texto fica menor que o salvo na enum do banco
        // todo: adicionar o texto minimizado na enum do banco
        console.log('Erro do fluxograma: ' + err.code);
        return res.status(200).json('Ok');
      }
    if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_BAD_NULL_ERROR') { // Erro de chave duplicada ou falta de valor em campo not null
      // comentando aqui para continuar o desenvolvimento dessa parte do projeto
      //fica faltando o tratamento de erros específicos do banco, esses erros são lançados pelo banco de dados e não pelo código, por isso não são instâncias de AppError ou ValidationError
      // ainda estou pensando em como fazer isso
        console.log("Erro de banco específico:" + err.code)
        return res.status(500).send('Erro de banco de dados');
     }else{
      console.log("Erro não tratado: " + err)
      return res.status(500).send("Algo deu errado");
     }
      
};

module.exports = errorHandler;