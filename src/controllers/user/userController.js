const User = require('../../models/userSchema');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypt = require('crypto');
const randomstring = require('randomstring')


// Generate a 6-digit OTP
function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

// Send verification email with OTP
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

const sendSetPasswordMail = async(name,email,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,// True for 465, false for other ports
            requireTLS:true,
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASS
            }
        });

        const mailOptions = {
            from:process.env.EMAIL,
            to:email,
            subject:'Set User Passowrd - The Boult Audio Team',
            html:`
             <p>Hi ${name},</p>
            <p>You've requested to set your password at Boult Audio.</p>
            <p>Please click here to <a href="http://127.0.0.1:3000/set-password?token=${token}">set your password</a>.</p>
            <p>If you didn't request a password reset, please disregard this email.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at support@boultaudio.com.</p>
            <p>Thank you for choosing Boult Audio.</p>
            <p>Sincerely, The Boult Audio Team</p>
            `
        }
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: '+info.response)
    } catch (error) {
        console.error("Error while sending reset password email:", error);
    }
}
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);// Hash the password with 10 salt rounds
        return passwordHash;
    } catch (error) {
        console.log('error while password hashing',error)
    }
}

// Render the error page
const errorPage = async(req,res)=>{
    try{
        res.render('user/errorPage',{statusCode:404, message: "Page Not Found. Please try again later." })

    }catch(error){
        console.error("Error loading error page:", error);
        res.status(500).render('user/errorPage', {statusCode:500, message: "Internal server error. Please try again later." });
    }
}

// Load the home page
const loadHomePage = async(req,res)=>{
    try{
        const userId = req.session.userId;
        const messages = req.flash();//get flash messages
        if(userId){
            const userData = await User.findOne({_id:userId});
            res.render("user/home",{user:userData,messages});
        }else{
            res.render("user/home",{messages});

        }
    }catch(error){
        console.log('Home page not found');
        // Render the error page with appropriate status code and message
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal Server Error. Please try again later."
        })
        
    }
}

// Load the login page
const loadLogin = async(req,res)=>{
    try{
        res.render('user/log-in');
    }catch(error){
        console.log(error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });
    }
}

// Load the signup page
const loadSignup = async(req,res)=>{
    try{
        res.render('user/sign-up')// Render the signup page
    }catch(error){
        console.log(error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        })
    }
}

//user signup logic
const signupUser = async(req,res)=>{
    try{
        const {name,email,phone,password,confirm_password,termsAccepted} = req.body;
        // Check if all required fields are provided
        if (!name || !email || !phone || !password || !confirm_password || !termsAccepted) {
            return res.render("user/sign-up",{message: 'All fields are required.',color:'danger'})
        }

        // Check if passwords match
        if(password!==confirm_password){
            return res.render("user/sign-up",{message:"Password do not match!",color:'danger'})
        }
        // Check if user already exists by email
        const existingUser = await User.findOne({email});
        if(existingUser){
            if(existingUser.googleId && !existingUser.password){
                // User signed up using Google but hasn't set a password yet
                return res.render('user/sign-up',{
                    message: `You already have google account with this Gmail. Please set a password <strong><a href="/set-password-request">here</a></strong> or login using Google`,
                    color:"danger",
                    email:existingUser.email,
                });    

            }else if(existingUser.googleId && existingUser.password){
                // in case user signed up using Google and set a password 
                return res.render('user/sign-up',{
                    message:`You already have an account with this Gmail. Please login <strong><a href="/login">here</a></strong>`,
                    color:"danger",
                    setPassword: true,
                    email:existingUser.email,
                });

            }else{
                //user already exists with this email (for users that logged regular way )
                return res.render('user/sign-up',{
                    message:"This email is already registered. Please log in with your credentials or use the forgot password option in <strong><a href='/login'>login</a></strong> if needed.",
                    color: 'danger',
                });
            }
        }

        // Check if user already exists by phone
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return res.render("user/sign-up", { message: "Mobile number already in use!", color: "danger" });
        }

        // Generate OTP and send verification email
        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email,otp);
        if(!emailSent){
            return res.json("Email not sent please check you internet connection");
        }
                
        // Store OTP and user data in session
        req.session.userOtp = otp;
        req.session.userData = {name,email,phone,password,termsAccepted};

        res.redirect("/verify-otp");
        console.log('OTP Sent',otp);
     
    }catch(error){
        console.error("sign up error",error.message);
        res.status(500).render("user/errorPage", {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });
    }

}
// // Render page to request password reset link
const loadPasswordSetRequestPage = async(req,res)=>{
    try {
        res.render('user/password-set-request');
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        })
    }
}
// Handle password reset link request (collect email, generate token, and send email)
const handlePasswordSetRequest = async(req,res)=>{
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ success: false, message: 'No account with the email found.' });
        }else if(user.password){
            return res.status(400).json({ success: false, message: 'You already have a password. Please log in or use the "Forgot Password" option.' });
        }else if(user.isBlocked===true){
            return res.status(400).json({ success: false, message: 'Your account has been blocked. Please contact support.'});
        }else{
            // Generate a secure token using randomstring  library
            const randomString = randomstring.generate();
            // Set the token and token expiry (e.g., token valid for 1 hour)
            const tokenExpiry = Date.now() + 3600000; // 1 hour from now
            // Store token in the user's document (you can also store expiration time for better security)
            await User.updateOne({email:email},{$set:{
                token:randomString,
                tokenExpiry:tokenExpiry
            }});
            // Send email with password reset link
            sendSetPasswordMail(user.name,user.email,randomString);
            return res.status(200).json({ success: true, message: 'Please check your email for instructions to reset your password.' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });
    }

}
// set password for the google signup persons
const loadPasswordSetPage = async(req,res)=>{
    try {
        const {token} = req.query;
        const user = await User.findOne({token:token});
        // If the token is invalid or expired
        if(!user){
            return res.status(404).render('user/errorPage', {
                statusCode: 404,
                message: "The link for setting your password is invalid or has expired. Please request a new link."
            });
        }

        
        // If the user is valid, render the page to set a new password
       return res.render('user/set-password', { email: user.email });
        
    } catch (error) {
        console.error("Error loading set password page:", error);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });  
    }
}


// Handle setting a new password
const handlePasswordSet = async(req,res)=>{
    try {
        const {email,password,confirmPassword} = req.body;
        //check if the password and confirmPassword match
        if(password !==confirmPassword){
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match. Please try again.'
            });
        }
        if(password.length<8){
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.'
            });
        }

        // Regular expression to check if the password contains at least one letter, one number, and one special character
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one letter, one number, and one special character.'
            });
        }

        //find the user and update the password.
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found. Please try again."
            });
        }

        // Check if the token has expired
        if (Date.now() > user.tokenExpiry) {
            return res.status(400).json({
                success: false,
                message: 'The reset link has expired. Please request a new one.'
            });
        }
        // Hash the new password and update the user record
        user.password = await securePassword(password);
        user.token = ''//clear the token to prevent reuse
        await user.save();
        //  Send success response 
        return res.status(200).json({
            success: true,
            message: "Password successfully updated! You can now log in."
        });

        
    } catch (error) {
        console.error(error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });
        
    }
}
//load OTP verification page.
const loadVerifyOtp = async(req,res)=>{
    try{
        //check if user data is in session 
        if(!req.session.userData){
            //can use flash for sending messages along with a redirecting(included the middleware also in the app.js file)
            req.flash('error', "Your session has timed out. Please try again."); // Set session timout message
            return res.redirect('/signup')
        }
        res.render('user/verify-otp');

    }catch(error){
        console.log('error while loading verify-login page',error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });

    }
}

//OTP verification
const verifyOtp = async(req,res)=>{

    try{
        // Ensure user data exists or user session is still active
        if (!req.session.userData) {
            return res.json({success:false,title:"Sessionn Expired", message:'Your session has expired. Please try again.'})
        }
        const {otp} = req.body;
        const user = req.session.userData
        if(otp===req.session.userOtp){
            // Hash the user's password
            const passwordHash = await securePassword(user.password);
            const saveUserData = new User({
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
                termsAccepted:user.termsAccepted,
                isVerified:true,
                googleId: user.googleId || null,

            });


            // Save the user to the database
            await saveUserData.save();

            // Update the session with the new user ID
            req.session.userId = saveUserData._id;
            delete req.session.userData; // Clear the signup session data


            // Send a success response with a redirect URL
            return res.json({success:true,message:'Verification successful! Redirecting to Home',redirectUrl:"/"})
        }else{
            res.json({success:false,title:"Invalid OTP",message: "Please try again"});
        }

    }catch(error){
        console.error("Error verifying OTP",error);
        res.status(500).json({success:false,title:"An error occured",message:'Please Try again'});
    }
}

//OTP resend verificatoin.
const resendOtp = async(req,res)=>{
    try {
        // Check if userData exists in the session
        if (!req.session.userData) {
            return res.json({ success: false,title:'Session Expired', message: "Please try again",redirectUrl:"/signup" });
        }
        const {email} = req.session.userData;
        
        const otp = generateOtp ();
        const emailSent = await sendVerificationEmail(email,otp);
        if(emailSent){
            console.log("Resend OTP:",otp);
            req.session.userOtp = otp;
            return res.status(200).json({success:true,title:'Successful',message:"OTP Resend  Successfully"});

        }else{
            return res.json({success:false,title:"Failed to resend OTP.",message:"Please try again"})
        }
    } catch (error) {
        console.error("Error while resending OTP",error);
        return res.status(500).json({success:false,message:"Internal Server Error. Please try again"});
    }
}

//login functionality
const login = async(req,res)=>{
    try {
        
        const {email,password,rememberMe} = req.body;
        // Find user by email (case-insensitive)
        const user = await User.findOne({isAdmin:0,email:email,});
        if(!user){
            return res.render("user/log-in",{message:"This email address you entered is not registered with any account. Please check your email or sign up for a new account.",color:"danger"});
        }
        // Check if the user is blocked
        if(user.isBlocked){
            req.flash
            return res.render("user/log-in",{message:"User is blocked, Please contact admin",color:"danger"})
        }
        // Check if the user has a Google account
        if(user.googleId&&!user.password){
            return res.render('user/log-in',{
                message: `You already have google account with this Gmail. Please set a password <strong><a href="/set-password-request">here</a></strong> or login using Google`,
                color:"danger",})
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.render("user/log-in",{message:"Incorrect password",color:"danger"})
        }
        // Handle "Remember Me" functionality
        if(rememberMe){
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days;
        }else{
            //set session to expire when the browser closes.
            req.session.cookie.expires = false;
        };
        // Store user id into the session object user
        req.session.userId = user._id;
        console.log(req.session.userId)
        req.flash("success", "Successfully logged in!");

        // Redirect to home after successful login
        return res.redirect('/');
    } catch (error) {
        console.error("login error",error);
        res.render('user/log-in',{message:"login failed. Please try again later",color:'danger'});
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                console.error('Session destruction error',err);
                return res.status(500).render('user/errorPage', { 
                    statusCode: 500, 
                    message: 'An error occurred while logging out. Please try again later.' 
                });
            }
            return res.redirect("/login")
        })
        
    } catch (error) {
        console.error('Logout error:', error); 
        return res.status(500).render('user/errorPage', { 
            statusCode: 500, 
            message: 'An unexpected error occurred. Please try again later.' 
        });
    }
}

module.exports = {
    loadHomePage,
    loadLogin,
    errorPage,
    loadSignup,
    signupUser,
    loadPasswordSetRequestPage,
    handlePasswordSetRequest,
    loadPasswordSetPage,
    handlePasswordSet,
    loadVerifyOtp,
    verifyOtp,
    resendOtp,
    login,
    logout
}




