const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require('../../models/userSchema');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const multer = require('../../config/multerConfig');

 
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

const addProduct = async (req, res) => {
    try {
        //ensure the target directory exists, if not make one.
        const targetDir = path.resolve('public', 'uploads', 'product-images');

        if(!fs.existsSync(targetDir)){
            fs.mkdirSync(targetDir,{recursive:true})
        }
        // Validation for required fields
        const { name, category, description, stock, regularPrice, salePrice, productOffer, status } = req.body;
        console.log(req.body)
        const productColors = req.body.productColors.split(',');//get colors from the hiden input in the ejs file.
        const errors = {};
        if (!name || !/^[a-zA-Z0-9\s\-]+$/.test(name)) errors.name = 'Valid product name required';
        if (!category) errors.category = 'Category is required';
        if (!productColors) errors.productColors = 'Color selection required';
        if (!description) errors.description = 'Description is required';
        if (stock === undefined || stock < 0) errors.stock = 'Valid stock quantity required';
        if (regularPrice === undefined || regularPrice < 0) errors.regularPrice = 'Valid regular price required';
        if (salePrice === undefined || salePrice < 0) errors.salePrice = 'Valid sale price required';
        if (productOffer === undefined || productOffer < 0 || productOffer > 100) errors.productOffer = 'Offer percentage (0-100) required';
        if (!status) errors.status = 'Product status is required';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        // Ensure images are provided
        if (!req.files || req.files.length < 3) {
            return res.status(400).json({ message: 'At least 3 images are required' });
        }

        const productExists = await Product.findOne({ name });

        if (!productExists) {
            const images = [];
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;
                    const resizedImagePath = path.join('public', 'uploads', 'product-images', req.files[i].filename); // Fixed path
                    await sharp(originalImagePath).resize({ width: 440, height: 440 }).toFile(resizedImagePath);
                    images.push(req.files[i].filename);
                }
            }

            const categoryId = await Category.findOne({ _id: category }); // Use correct variable
            if (!categoryId) {
                return res.status(400).json({ message: 'Invalid category name' });
            }

            const newProduct = new Product({
                name,
                category: categoryId._id, // Use category ID instead of name
                productColors,
                description,
                images: images, // Store image paths after resizing
                stock,
                regularPrice,
                salePrice,
                productOffer,
                status,
            });

            await newProduct.save();
            return res.status(201).json({ message: 'Product added successfully!' }); // Send success message
        } else {
            return res.status(400).json({ message: 'Product already exists, please try with another name' });
        }
    } catch (error) {
        console.log('Error saving product', error);
        return res.status(500).json({ message: 'Internal server error' }); // Return error response
    }
}





module.exports = {
    loadAddProductPage,
    loadAllProducts,
    addProduct

}






