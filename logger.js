const logger = (req,res,next)=>{
    const metodo = req.method;
    const url = req.url;
    console.log(metodo, url);
    next();
}

module.exports = logger;