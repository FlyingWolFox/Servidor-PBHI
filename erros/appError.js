//Classe de erros personalizados, "AppError" são erros que não são de validação, e sim erros de banco de dados ou erros de servidor
class AppError extends Error {
    constructor(errorCode, message, statusCode) {
      super(message);
      this.errorCode = errorCode;
      this.statusCode = statusCode;
    }
  }
  
  module.exports = AppError;
  