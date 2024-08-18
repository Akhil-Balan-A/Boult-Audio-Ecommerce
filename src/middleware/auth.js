const isLogin = (req,res,next)=>{
    try{
        if(req.session.user_id){
            next();
        }else{
            res.redirect('/register')
        }
    }catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const isLogout = (req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/home')
        }else{
            next();
        }
    }catch(error){
        console.log(error.message);
        res.status(500).send('internal Server Error')
    }
};


module.exports = {
    isLogin,
    isLogout
};