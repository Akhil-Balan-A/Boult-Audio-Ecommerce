const express = require('express');
const user_route = express.Router();
const session = require('express-session');
const cookieParser = require('cookie-parser');


user_route.use(session({
    secret:process.env.SESSIONSECRETUSER,
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:60000000}
}));

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
user_route.get('/login',userController.loadRegister);


module.exports = user_route;


