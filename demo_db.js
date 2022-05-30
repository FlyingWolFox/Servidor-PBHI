/*var mysql = require('mysql');

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dumb123"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
*/
//funcoes database
const insert = (data = {})=>{
    var sql = "INSERT INTO contato(nome, email,comentario) VALUES ?";
    var values = data;
    db.query(sql, values, function(err, result){
        if(err) throw err;
        console.log("numero de registros inseridos:" + result.affectedRows);
    });
}
module.exports = insert;