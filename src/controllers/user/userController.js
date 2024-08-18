const User = require('../../models/userSchema');

const pageNotFound = async(req,res)=>{
    try{
        res.render('user/page-404')

    }catch(error){
        res.redirect('/pageNoteFound')
    }
}

const loadHomePage = async(req,res)=>{
    try{
        return res.render('user/home')
    }catch(error){
        console.log('Home page not found');
        res.status(500).send('Server error')
    }
}

const loadLogin = async(req,res)=>{
    try{
        res.render('user/log-in')

    }catch(error){
        console.log(error.message);
        res.status(500).send('server error')
    }
}

const loadSignup = async(req,res)=>{
    try{
        res.render('user/sign-up')
    }catch(error){
        console.log(error.message);
        res.status(500).send("server error")
    }
}

const signupUser = async(req,res)=>{
    try{
        const {name,email,phone,password} = req.body;
        const newUser = new User({name,email,phone,password})
        await newUser.save();
        return res.redirect('/signup');
        
    }catch(error){
        console.log("Error while saving user",error.message);
        res.status(500).send('internal server error')
    }
}

module.exports = {
    loadHomePage,
    loadLogin,
    pageNotFound,
    loadSignup,
    signupUser
}
