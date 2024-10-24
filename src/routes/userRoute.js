const express = require('express');
const userRoute = express.Router();
const cookieParser = require('cookie-parser');
const passport = require('passport');
const userAuth = require('../middleware/userAuth')


// Use cookie parser middleware
userRoute.use(cookieParser());

// Middleware to set cache headers
userRoute.use((req,res,next)=>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
});

// Import authentication middleware
const auth = require('../middleware/userAuth');

// Import user controller
const userController = require('../controllers/user/userController');
const nocache = require('nocache');

// User Routes
userRoute.get('/errorPage',userController.errorPage)
userRoute.get('/',userController.loadHomePage);
userRoute.get('/login',userAuth.isLogout,userController.loadLogin);
userRoute.get('/signup',userAuth.isLogout,userController.loadSignup);
userRoute.post('/signup',userController.signupUser);
userRoute.get('/verify-otp',userController.loadVerifyOtp)
userRoute.post('/verify-otp',userController.verifyOtp);
userRoute.post("/resend-otp",userController.resendOtp);

// Route to start the Google OAuth process from login
userRoute.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Google OAuth callback route for login
userRoute.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login',failureFlash:true}),
    (req,res)=>{
        // On successful login, store the user Id in the session
        req.session.userId = req.user.id
        req.flash('success', 'Login successful! Welcome back!');
        // Successful authentication, redirect to the homepage (or any other route)
        res.redirect('/');
    }
);


// Route to render the password reset request page (asks for email)
userRoute.get('/set-password-request',userController.loadPasswordSetRequestPage);
// Route to handle the password reset link request
userRoute.post('/set-password-request',userController.handlePasswordSetRequest);
// Route to load the password reset page after clicking the email link (validate token)
userRoute.get('/set-password',userController.loadPasswordSetPage);
// Route to handle the new password submission
userRoute.post('/set-password',userController.handlePasswordSet);

userRoute.post("/login",userController.login);
userRoute.get("/logout",userAuth.isLogin,userController.logout);


// Export the router
module.exports = userRoute;



