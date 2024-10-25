const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require('../../models/userSchema');
const path = require('path');
const sharp = require('sharp');
const fs = require('sharp');

 
const loadAllProducts = async(req,res)=>{
    try {
        const {isBlocked,status} = req.query;
        const search = req.query.search || '';
        const page = parseInt(req.query.page)||1;
        const limit = parseInt(req.query.limit||8);
        const skip = (page-1)*limit;

        // Filter to search by name, description, or status if needed
        let filter = {};

        if(search){
            filter.$or = [
                { name: { $regex: ".*" + search + ".*", $options: 'i' } },
                { description: { $regex: ".*" + search + ".*", $options: 'i' } }
            ];
        }
        // Add filter for isBlocked if specified
        if (isBlocked) {
            filter.isBlocked = isBlocked === 'true'; // Convert to boolean
        }

        // Add filter for status if specified
        if (status) {
            filter.status = status;
        }

        //fetch produts with category information and apply pagination
        const products = await Product.find(filter)
        .populate('category','name')//Populate caategory name as needed
        .limit(limit)
        .skip(skip)
        .sort({createdAt:-1});//sort by newest first;
        //Total product count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts/limit);
        res.render('admin/products',{
            products,
            currentPage:page,
            totalPages,
            search,
            limit,
            isBlocked,
            status
        });
    } catch (error) {
        console.log('Error loading add product page',error);
        res.redirect('/errorPage');
        
    }
}

const loadAddProductPage = async(req,res)=>{
    try {
        // Retrieve all categories (active) to populate the category dropdown
        const category = await Category.find({status:true});

        res.render('admin/addProduct',{data:category})
        
    } catch (error) {
        console.log('Error loading add product page', error);
        res.redirect('/errorPage');  
    }
}



module.exports = {
    loadAddProductPage,
    loadAllProducts,

}






