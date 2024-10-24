const isLogin = (req, res, next) => {
    try {
        if (req.session.userId) {
            // User is logged in, allow them to proceed
            next();
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/errorPage', {
            statusCode: 500,
            message: "Internal server error. Please try again later."
        });
    }
};

const isLogout = (req, res, next) => {
    try {
        if (req.session.userId) {
            res.redirect('/');
        } else {
            // User is not logged in, allow them to proceed
            next();
        }
    } catch (error) {
        console.log(error.message);
        // You should handle errors appropriately here
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    isLogin,
    isLogout
};
