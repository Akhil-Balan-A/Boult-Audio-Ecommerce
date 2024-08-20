const User = require("../../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const loadLogin = async(req,res)=>{
    if(req.session.admin){
        return res.redirect("/admin")
    }
    res.render("admin/admin-login",{message:null});
}
const login = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const admin = await User.findOne({email,isAdmin:true})
        if(admin){
            const passwordMatch =await bcrypt.compare(password,admin.password)
            if(passwordMatch){
                req.session.admin=true;
                return res.redirect('/admin')
            }else{
                return res.redirect("/admin/login")
            }
        }else{
            return res.redirect('/admin/login')
        }

        
    } catch (error) {
        console.log('login error',error);
        return res.redirect('/admin/pageerror')
        
    }
}

const loadDashboard = async(req,res)=>{
    if(req.session.admin){
        try {
            res.render("admin/dashboard");
            
        } catch (error) {
            res.redirect('/admin/pageerror');
        }
    }
}

const pageerror = async(req,res)=>{
    res.render('Admin/admin-error')
}


module.exports = {
    loadLogin,
    login,
    loadDashboard,
    pageerror
}