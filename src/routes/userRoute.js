const express = require('express');
const userRoute = express.Router();
const cookieParser = require('cookie-parser');
const passport = require('passport');


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
const auth = require('../middleware/auth');

// Import user controller
const userController = require('../controllers/user/userController');

// User Routes
userRoute.get('/errorPage',userController.errorPage)
userRoute.get('/',userController.loadHomePage);
userRoute.get('/login',userController.loadLogin);
userRoute.get('/signup',userController.loadSignup);
userRoute.post('/signup',userController.signupUser);
userRoute.get('/sample-page',userController.anyPageSampleRender)//for sample page checking only
userRoute.post('/verify-otp',userController.verifyOtp);
userRoute.post("/resend-otp",userController.resendOtp);
// Route to start the Google OAuth process
userRoute.get('/auth/google',passport.authenticate('google',{scope:["profile","email"]}));
// Google OAuth callback route
userRoute.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),
    (req,res)=>{
        // Successful authentication, redirect to the homepage (or any other route)
        res.redirect('/');
    }

);

userRoute.post("/login",userController.login);
userRoute.get("/logout",userController.logout);


// Export the router
module.exports = userRoute;


