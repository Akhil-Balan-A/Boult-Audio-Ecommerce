const User = require('../../models/userSchema');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')

function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function sendVerificationEmail(email,otp){
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASS
            }
        });
        const info = await transporter.sendMail({
            from:process.env.EMAIL,
            to:email,
            subject:'Welcome to Boult Audio  - Verify Your Mail',
            text: `Your OTP is ${otp}`,
            html:`<p> Your OTP: ${otp}
            <p>If you didn't sign up for an account with Boult Audio, please disregard this email.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at support@boultaudio.com.</p>
            <p>Thank you for choosing Boult Audio.</p>
            <p>Sincerely, The Boult Audio Team</p>`
        });

        return info.accepted.length>0

    } catch (error) {
        console.error("Error in sending Email ",error);
        return false;
    }
}

const pageNotFound = async(req,res)=>{
    try{
        res.render('user/page-404')

    }catch(error){
        res.redirect('/pageNoteFound')
    }
}

const loadHomePage = async(req,res)=>{
    try{
        const user = req.session.user;
        if(user){
            const userData = await User.findOne({_id:user});
            res.render("user/home",{user:userData})
        }else{
            res.render("user/home");

        }
    }catch(error){
        console.log('Home page not found');
        res.status(500).send('Server error')
    }
}


const loadLogin = async(req,res)=>{
    try{
        if(!req.session.user){
            return res.render('user/log-in')
        }else{
            res.redirect('/');
        }

    }catch(error){
        console.log(error.message);
        res.status(500).send('server error')
        res.redirect("/pageNotFound")
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
        const {name,email,phone,password,confirm_password,termsAccepted} = req.body;
        if(password!==confirm_password){
            return res.render("user-sign-up",{message:"Password do not match!"})
        }
        const findUserByEmail = await User.findOne({email});
        const findUserByPhone = await User.findOne({phone});
        if(findUserByEmail&&findUserByPhone){
            return res.render("user/sign-up",{message:"User with this email and Phone number already exists!",color:'danger'});
        }else if(findUserByEmail){
            return res.render("user/sign-up",{message:"Email already in Use!",color:'danger'})
        }else if(findUserByPhone===phone){
            return res.render("user/sign-up",{message:"Mobile number already in Use!",color:'danger'})
        }
        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email,otp);
        if(!emailSent){
            return res.json("email-error");
        }

        req.session.userOtp = otp;
        req.session.userData = {name,email,phone,password,termsAccepted};

        res.render("user/verify-otp");
        console.log('OTP Sent',otp);
     
    }catch(error){
        console.error("sign up error",error.message);
        res.status(500).send('internal server error')
        res.redirect("/pageNotFound")
    }
    
}

const anyPageSampleRender = async(req,res)=>{
    try {
        return res.render('user/verify-otp')
        
    } catch (error) {
        console.error("error when loading the samplerender",error)
    }
}

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log('error while password hasing',error)
    }
}

const verifyOtp = async(req,res)=>{

    try{
        const {otp} = req.body;
        console.log(otp);
        if(otp===req.session.userOtp){
            const user = req.session.userData
            const passwordHash = await securePassword(user.password);
            const saveUserData = new User({
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
                termsAccepted:user.termsAccepted
            });

            await saveUserData.save();
            req.session.user = saveUserData._id;
            res.json({success:true,redirectUrl:"/"})
        }else{
            res.status(400).json({success:false,message:"Invalid OTP, Please try again"});
        }

    }catch(error){
        console.error("Error Vefifying OTP",error);
        res.status(500).json({success:false,message:"An error occured"});
    }
}

const resendOtp = async(req,res)=>{
    try {
        const {email} = req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }
        const otp = generateOtp ();
        req.session.userOtp = otp;
        const emailSend = await sendVerificationEmail(email,otp);
        if(emailSend){
            console.log("Resend OTP:",otp);
            res.status(200).json({success:true,message:"OTP Resend  Successfully"});

        }else{
            res.status(500).json({success:false,message:"Failed to resend OTP. Please try again"})
        }
    } catch (error) {
        console.error("Error while resending OTP",error);
        res.statu(500).json({success:false,message:"Internal Server Error. Please try again"});
    }
}

const login = async(req,res)=>{
    try {
        const {email,password,rememberMe} = req.body;
        const findUser = await User.findOne({isAdmin:0,email:email,});
        if(!findUser){
            return res.render("user/log-in",{message:"User not found",color:"danger"});
        }
        if(findUser.is_blocked){
            return res.render("user/log-in",{message:"User is blocked by admin",color:"danger"})
        }
        const passwordMatch = await bcrypt.compare(password,findUser.password);
        if(!passwordMatch){
            return res.render("user/log-in",{message:"Incorrect password",color:"danger"})
        }
        if(rememberMe){
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days;
        }
        req.session.user = findUser._id;
        res.redirect('/');
    } catch (error) {
        console.error("login error",error);
        res.render('user/log-in',{message:"login failed. Please try again later",color:'danger'});
    }
}

const logout = async(req,res)=>{
    try {

        req.session.destroy((err)=>{
            if(err){
                console.log('Session destruction error');
                return res.redirect("/pageNotFound")
            }
            return res.redirect("/login")
        })
        
    } catch (error) {
        console.log('Logout error',error);
        res.redirect("/pageNotFound")
    }
}

module.exports = {
    loadHomePage,
    loadLogin,
    pageNotFound,
    loadSignup,
    signupUser,
    anyPageSampleRender,
    verifyOtp,
    resendOtp,
    login,
    logout
}




