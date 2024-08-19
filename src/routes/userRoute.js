const express = require('express');
const user_route = express.Router();
const cookieParser = require('cookie-parser');


user_route.use(cookieParser());

user_route.use((req,res,next)=>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
});

const auth = require('../middleware/auth');


const userController = require('../controllers/user/userController');

user_route.get('/pageNotFound',userController.pageNotFound)
user_route.get('/',userController.loadHomePage);
user_route.get('/login',userController.loadLogin);
user_route.get('/signup',userController.loadSignup);
user_route.post('/signup',userController.signupUser);
user_route.get('/samplepage',userController.anyPageSampleRender)////////////////////////
user_route.post('/verify-otp',userController.verifyOtp);
user_route.post("/resend-otp",userController.resendOtp);


module.exports = user_route;


