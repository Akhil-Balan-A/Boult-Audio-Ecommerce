const express = require('express');
const admin_route = express.Router();
const adminController = require('../controllers/admin/adminController');
const {userAuth,adminAuth} = require('../middleware/auth');




admin_route.get('/login',adminController.loadLogin);
admin_route.post('/login',adminController.login);
admin_route.get('/',adminAuth,adminController.loadDashboard);
admin_route.get('/pageerror',adminController.pageerror);





module.exports = admin_route





