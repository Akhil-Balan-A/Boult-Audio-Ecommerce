const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
require('./src/config/dbConnect')();
const session = require('express-session');


// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//session handling
app.use(session({
    secret:process.env.SESSIONSECRETUSER,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,//in product can be change to true as https usage
        httpOnly:true,
        maxAge:24*60*60*1000 //24 hours validity
    }

}));

//set view engine to EJS.
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'src/views'));

//server static files in public
app.use('/Admin',express.static(path.join(__dirname,'public/Admin')));
app.use('/User',express.static(path.join(__dirname,'public/User')));


//for user routes.
const userRoute = require('./src/routes/userRoute');
app.use('/',userRoute);


//for admin routes.
const adminRoute = require('./src/routes/adminRoute');
app.use('/admin',adminRoute);

//start server.
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running on the port ${PORT}.... use npm run dev`)
});















