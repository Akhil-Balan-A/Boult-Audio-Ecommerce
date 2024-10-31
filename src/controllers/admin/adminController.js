const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");

const loadAdminLogin = async(req,res)=>{
    try{
        res.render('admin/admin-login');
    }catch(error){
        console.log(error.message);
        res.status(500).send('error while login');
    }
}
const loginAdmin = async(req,res)=>{
    try {
        const {email,password} = req.body
        const admin = await User.findOne({email,isAdmin:true});
        if(admin){
            const passwordMatch = await bcrypt.compare(password,admin.password);
            if(passwordMatch){
                req.session.adminId = admin._id; // Set userId in session
                req.session.isAdmin = true; // store admin status in session
                req.session.adminName = admin.name;
                return res.redirect('/admin') // redirect to dashboard
            }else{
                return res.render('admin/admin-login',{message:'Incorrect password',color:'danger'})
            }
        
        }else{
            return res.render('admin/admin-login',{message:'Invalid credentials',color:'danger'})
        }

        
    } catch (error) {
        console.log('login error',error);
        return res.redirect('/admin/errorPage')  
        
    }
}

const loadDashboard = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        res.render('admin/dashboard',{adminName}); // Render the dashboard
    } catch (error) {
        console.log('login error',error);
        return res.redirect('/admin/errorPage')
    }

}

const errorPage = async(req,res)=>{
    res.render('admin/admin-error')
}

const logout = async (req,res)=>{
    try {
        req.session.destroy(error=>{
            if(error){
                console.log('Error destroying the session',error);
                return res.redirect('/admin/errorPage');
            }
            res.redirect('/admin/login');
        });
        
    } catch (error) {
        console.log('unexpected error during logout',error);
        res.redirect('/admin/errorPage')
        
    }
}


const sampleLoad = async(req,res)=>{
    res.render('loadEjs/sample')
}

module.exports = {
    loadAdminLogin,
    loginAdmin,
    loadDashboard,
    errorPage,
    logout,
    sampleLoad
}


