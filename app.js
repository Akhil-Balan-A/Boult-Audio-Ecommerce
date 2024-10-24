const express = require('express');
const app = express();
const path = require('path');
require('./src/config/dbConnect')();
const session = require('express-session');
const passport = require('./src/config/passport')
const flash = require('connect-flash');
require('dotenv').config();
const methodOverride = require('method-override');
const nocache = require('nocache');



// Middleware to parse JSON and URL-encoded data.
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(nocache());
app.use(methodOverride('_method'));

//session handling
app.use(session({
    secret:process.env.SESSIONSECRETUSER,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,//in product can be change to true when using https
        httpOnly:true,
        maxAge:null//Default session duration , if choose remember me at login 30 day duration will get.
    }

}));

//connect-flash middleware
app.use(flash());

// Initialize Passport and session

app.use(passport.initialize());
app.use(passport.session());


//set view engine to EJS.
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'src/views'));

//server static files in public
app.use('/Admin',express.static(path.join(__dirname,'public/Admin')));
app.use('/User',express.static(path.join(__dirname,'public/User')));

// Middleware to set session information in res.locals for admin header Name visibility wihtou send name in the render itself.
app.use((req, res, next) => {
    res.locals.adminId = req.session.adminId || null;
    res.locals.adminName = req.session.adminName || null;
    next(); // Proceed to the next middleware or route handler
});

// This makes flash messages available to all views 
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  });


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

























