//Descrição: Arquivo responsável por separar a lógica de tryCatch dos arquivos de rotas.
// Essa função recebe uma função como parametro e amarra ela dentro de um try catch block, evitando a repetição de blocos tryCatch em outros trechos.
 var tryCatch = (fn) =>  async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (err) {
      return next(err);
    }
  };

module.exports = tryCatch;