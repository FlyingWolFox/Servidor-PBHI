//Classe para tratamento de erros de validação de dados, "ValidationError" são erros que são de validação
class ValidationError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  module.exports = ValidationError;