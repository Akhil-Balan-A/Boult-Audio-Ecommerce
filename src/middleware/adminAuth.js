const isLogin = async (req, res, next) => {
    try {
        // Check if the user is logged in and if they have admin privileges
        if (req.session.adminId && req.session.isAdmin) {
            next(); // Call next() to move to the next middleware or route as user is admin
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.adminId) {
            res.redirect('/admin');// Redirect to the admin dashboard
        } else {
            next(); // Call next() to move to the next middleware or route
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"); // Handle error gracefully
    }
};

module.exports = {
    isLogin,
    isLogout
};

