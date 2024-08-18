const User = require('../../models/userModel');


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


const loadRegister = async(req,res)=>{
    try{
        res.render('user/login-or-register')

    }catch(error){
        console.log(error.message)
    }
}


module.exports = {
    loadHomePage,
    loadRegister,
    pageNotFound
}