const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require('../../models/userSchema');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const multer = require('../../config/multerConfig');

 
const loadAllProducts = async(req,res)=>{
    try {
        //Fetch all products from the database
        const products = await Product.find().populate('category')

        res.render('admin/products',{products})
      
    } catch (error) {
        console.log('Error loading add product page',error);
        res.redirect('/errorPage');
        
    }
}


const loadAddProductPage = async(req,res)=>{
    try {
        // Retrieve all categories (active categories only) to populate the category dropdown
        const category = await Category.find({status:true});

        res.render('admin/addProduct',{data:category})
        
    } catch (error) {
        console.log('Error loading add product page', error);
        res.redirect('/errorPage');  
    }
}

const addProduct = async (req, res) => {
    try {
        
        // Validation for required fields
        const { name, category, description, stock, regularPrice, salePrice, productOffer, status } = req.body;
        let trimmedName = name.trim()// Trim whitespace from both ends of the product name
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

        // Convert name to lowercase to check for duplicates, ensuring case insensitivity
        const productExists = await Product.findOne({ name:trimmedName.toLowerCase()});


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

            const categoryData = await Category.findById( category ); 
            if (!categoryData) {
                return res.status(400).json({ message: 'Invalid category name' });
            }
            //calculate final sales price after category offer if any.
            const categoryOfferPercentage = parseFloat(categoryData.categoryOffer);
            const regularPriceValue = parseFloat(regularPrice);
            const salesPriceValue = parseFloat(salePrice);

            if(categoryOfferPercentage>0){
                const discount = ((regularPriceValue*categoryOfferPercentage)/100);
                var finalPrice = salesPriceValue - discount

            }else{
                finalPrice = salePrice;
            }


            const newProduct = new Product({
                name:trimmedName.toLowerCase(),//// Save the trimmed, lowercase name
                category: categoryData._id, // category ID saved as reference
                productColors,
                description,
                productImages: images, // Store image paths after resizing
                stock,
                regularPrice,
                salePrice,
                productOffer,
                status,
                salesPriceAfterCategoryOfferIfAny:finalPrice
            });
             // Retrieve all categories (active categories only) to populate the category dropdown

            await newProduct.save();
            req.flash('success', 'Product added successfully');
            res.redirect('/admin/addProduct')

        
        } else {
            req.flash('error', 'Product already exists, please try with another name');
            res.redirect('/admin/addProduct')

        }
    } catch (error) {
        console.log('Error while adding product', error);
        res.redirect('/errorPage');  
    }
}


const addProductOffer = async(req,res)=>{

    try {
            
    const percentage = parseInt(req.body.percentage);
    const productId = req.body.categoryId;
    const confirm = req.body.confirm || false;

    //amount validation.
    if(isNaN(percentage)||percentage<1||percentage>100){
        return res.status(400).json({
            status:false,
            message:'Offer percentage must be between 1 and 100'
        });

    }

    //find the product and validate it.

    const product = await Product.findById(productId).populate('category')
    if(!product){
        return res.status(404).json({
            status:false,
            message:"Product not found"

        })
    }
        // Check if the category has an existing offer
        const categoryOffer = product.category.categoryOffer
        if(categoryOffer>0&&!confirm){
            // If category has an offer, show a message
            return res.status(400).json({
                status:false,
                message:`This product's category already has an offer of ${categoryOffer}%. Please review the category before applying a new product offer.`
            })

        }

        //if no category offer, proceed with applying offer to the concerned product
        const updatedPorduct = await Product.findByIdAndUpdate(
            productId,
            {productOffer:percentage},
            {new:true} // used because then only the updatedProduct value will have latest updated data
            
        )

        return res.status(200).json({
            status:true,
            message:'Product offer of ${newOfferPercentage}% applied successfully.',
            updatedPorduct
        })


        
    } catch (error) {
        console.error('Error while adding category offer:', error);
        res.redirect('/errorPage');   
    }
}






module.exports = {
    loadAddProductPage,
    loadAllProducts,
    addProduct,
    addProductOffer

}






