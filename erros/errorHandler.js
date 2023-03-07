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
      return res.status(500).send("Algo deu errado");
};

module.exports = errorHandler;