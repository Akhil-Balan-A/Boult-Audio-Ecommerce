const express = require('express');
const adminRoute = express.Router();
const adminController = require('../controllers/admin/adminController');
const customerController = require('../controllers/admin/customerController');
const categoryController = require('../controllers/admin/categoryController');
const productController = require('../controllers/admin/productController')
const adminAuth = require('../middleware/adminAuth');
const upload = require('../config/multerConfig');

//Error management
adminRoute.get('/errorPage',adminController.errorPage);
//Login management
adminRoute.get('/login',adminAuth.isLogout,adminController.loadAdminLogin);
adminRoute.post('/login',adminController.loginAdmin);
adminRoute.get('/',adminAuth.isLogin,adminController.loadDashboard);
adminRoute.get('/logout',adminController.logout);
//Customer management
adminRoute.get('/customers',adminAuth.isLogin,customerController.customerInfo);
adminRoute.put('/blockCustomer/:id',adminAuth.isLogin,customerController.blockCustomer);
adminRoute.put('/unblockCustomer/:id',adminAuth.isLogin,customerController.unblockCustomer);
//Sample page load
adminRoute.get('/sampleLoad',adminController.sampleLoad);
//Category Manamgement
adminRoute.get('/category',adminAuth.isLogin,categoryController.loadCategoryPage);
adminRoute.post('/addCategory',adminAuth.isLogin,categoryController.addCategory);

//Product Management
adminRoute.get('/products',adminAuth.isLogin,productController.loadAllProducts);
adminRoute.get('/addProduct',adminAuth.isLogin,productController.loadAddProductPage);
adminRoute.post('/addProduct',upload.array('images',3),productController.addProduct)



module.exports = adminRoute










