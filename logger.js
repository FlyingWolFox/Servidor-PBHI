const logger = (req,res,next)=>{
    const metodo = req.method;
    const url = req.url;
    const hora = new Date().getFullYear();
    console.log(metodo, hora, url);
    next();
}

module.exports = logger;