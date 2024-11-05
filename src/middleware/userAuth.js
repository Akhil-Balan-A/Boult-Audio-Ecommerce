const User = require('../models/userSchema');
const isLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {
            // Fetch the latest user data from MongoDB
            const user = await User.findById(req.session.userId)
            //check if the user exists and if they are blocked or not
            if(user && user.isBlocked){
                // Redirect to login with a message
                req.flash('error', 'Your account has been blocked. Please contact support.');
                // Clear only user-related session data
                req.session.userId = null;
                res.redirect('/login');
            }else{   
                // User is logged in, allow them to proceed
                next();
            }

        } else {
            // User is not logged in properly cause code get refreshed hence 
            //user id is not saved in session.
            req.flash('error', 'session timed out!, please try again.');
            return res.redirect('/login');
            
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });
    }
};

const isLogout = (req, res, next) => {
    try {
        if (req.session.userId) {
           return  res.redirect('/');
        } else {
            // User is not logged in, allow them to proceed
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    isLogin,
    isLogout
};
