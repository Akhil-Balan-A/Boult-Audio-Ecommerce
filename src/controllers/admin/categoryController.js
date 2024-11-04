const Category = require('../../models/categorySchema');
const Product = require('../../models/productSchema')

const loadCategoryPage = async (req, res) => {
    try {
        // Fetch categories based on the filter
        const categoryData = await Category.find({})
        .sort({createdAt:-1})
            

        // Render the page with data and pagination information
        res.render('admin/category', {
            data: categoryData,
        });

    } catch (error) {
        console.log(error);
        res.redirect('/errorPage');
    }
};



const addCategory = async(req,res)=>{
    try {
        const { name, description, parentCategory, categoryOffer } = req.body;

        //validate the input fields
        if (!name || !description || !parentCategory ||!categoryOffer) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the category already exists (case-insensitive)
        const existingCategory = await Category.findOne({ name: new RegExp(`^${name}$`, 'i')});
        if (existingCategory) {
            return res.status(400).json({ message: 'Category name already exists.' });
        }
        // Convert status to boolean and categoryOffer to number
        const status = req.body.status === 'active'?true:false;
        const categoryOfferNumber = parseFloat(categoryOffer);

        // Create a new category object with the name in lowercase
        const newCategory = new Category({
            name:name.toLowerCase(),
            description,
            parentCategory,
            categoryOffer:categoryOfferNumber,
            status

        });

        //save the new category to the database.
        await newCategory.save();

        //redirect to category management page to show a success message
        return res.status(201).json({ message: 'Category added successfully!'});
        
    } catch (error) {
        console.error('Error adding category:', error);
        return res.status(500).json({ message: 'Server error.' });
        
    }

}

const addCategoryOffer = async(req,res)=>{
    try {
        const percentage = parseInt(req.body.percentage);
        const categoryId = req.body.categoryId;
        const confirm = req.body.confirm || false;

        //amount validation.
        if(isNaN(percentage)||percentage<1||percentage>100){
            return res.status(400).json({
                status:false,
                message:"Offer percentage must be between 1 and 100"
            });
        }

        // Find the category and validate it

        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).json({status:false,message:"Category not found"});
        }

        const productsWithOffer = await Product.find({ category: categoryId, productOffer: { $gt: 0 } });

           // If products have individual offers and no confirmation was provided, send warning
           if (productsWithOffer.length > 0 && !confirm) {
            return res.status(200).json({
                status: false,
                message: "Some products have individual offers. Confirm to apply the category discount.",
            });
        }
       

        // If no conflict or after confirmation, update the category with the new offer
        category.categoryOffer = percentage;
        await category.save();

         //update the product schema with updated category offer to adjust the final price.
         const products = await Product.find({category:categoryId});
         for(const product of products){
             const regularPriceValue = parseFloat(product.regularPrice);
             const salesPriceValue = parseFloat(product.salePrice)
             // Calculate the new final price based on the updated category offer
             const discount = (regularPriceValue*percentage)/100;
             product.salesPriceAfterCategoryOfferIfAny = salesPriceValue-discount;
             await product.save(); // Save the updated product instance so that each product will get updated the discount

         }
 
         //send success message
        return res.status(200).json({
            status: true,
            message: "Category offer added successfully and applied to Products",
            categoryOffer: percentage
        });



    } catch (error) {
        console.error('Error while adding category offer:', error);
        res.status(500).json({ message: 'Failed to add offer', error });   
    }

}

const removeCategoryOffer = async(req,res)=>{
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if(!category){
            return res.status(404).json({status:false,message:'Category not found'})
        }
        const percentage = category.categoryOffer
        const products = await Product.find({category:category._id});
        if(products.length>0){
            for(const product of products){
                const regularPrice = parseFloat(product.regularPrice);
                const discount = (regularPrice*percentage)/100;
                product.salesPriceAfterCategoryOfferIfAny = product.salesPriceAfterCategoryOfferIfAny+discount;
                await product.save();

            }
        }
        category.categoryOffer = 0;
        await category.save();
        return res.json({
            status: true
        });

        
    } catch (error) {
        console.error('Error while removing category offer:', error);
        return res.status(500).json({ message: 'Failed to remove offer', error });
        
    }

}

const activateCategory = async(req,res)=>{
    try {
        const {categoryId} = req.body
        if(!categoryId){
            return res.status(400).json({status:false, message: 'No category found' });
        }
        await Category.updateOne({_id:categoryId},{$set:{status:true}});
        return res.status(200).json({
            status: true,
            message: 'Category activated successfully'
        });
    } catch (error) {
        console.log('error while status activation',error)
        res.redirect('/errorPage');
    }

}

const inactivateCategory = async(req,res)=>{
    try {
        const {categoryId} = req.body;
        if(!categoryId){
            return res.status(400 ).json({status:false, message: 'No category found' });
        }
        await Category.updateOne({_id:categoryId},{$set:{status:false}});
        return res.status(200).json({
            status: true,
            message: 'Category deactivated successfully'
        });
    } catch (error) {
        console.log('error while status activation',error)
        res.redirect('/errorPage');    
    }

}

const loadEditCategory = async(req,res)=>{
    try {
        const categoryId = req.query.id;
        const category = await Category.findById(categoryId)
        res.render('admin/edit-category',{category})
        
    } catch (error) {
        console.log('error while loading editCategory page',error)
        res.redirect('/errorPage');   
    }
}


const editCategory = async(req,res)=>{
    try {
        const { name, description, parentCategory, categoryOffer,categoryId,confirm } = req.body;

        //validate the inpt fields
        if (!name || !description || !parentCategory ||!categoryOffer) {
            return res.status(400).json({status:false,message: 'All fields are required.' });
        }


        // Find the existing category to edit
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({status:false, message: 'Category not found' });
        }

        // Check if a category with the same name other than the category currently being edited (categoryId) (case-insensitive) 
        const duplicateCategory = await Category.findOne({name:new RegExp(`^${name}$`, 'i'),_id:{$ne:categoryId}});
        if(duplicateCategory){
            return res.status(400).json({status:false,message:"Category name already exists"});
        }

        // Convert status to boolean and categoryOffer to number
        const status = req.body.status === 'active'?true:false;
        const categoryOfferNumber = parseFloat(categoryOffer);

        // Check if category offer changed
        if(categoryOfferNumber!==existingCategory.categoryOffer){
            //category offer changed, so let the admin warn if products in the category has any product level offer
            const productsWithOffer = await Product.find({ category: existingCategory._id, productOffer: { $gt: 0 } });
           if (productsWithOffer.length > 0 && !confirm) {
                return res.status(200).json({
                status: false,
                message: "Some products have individual offers. Confirm to apply the category discount.",
                });
            }

        }

        //update the category fields
       existingCategory.name = name.toLowerCase();
       existingCategory.description = description;
       existingCategory.parentCategory = parentCategory;
       existingCategory.categoryOffer = categoryOffer;
       existingCategory.status = status;

        //save the updated category.
        await existingCategory.save();

        //redirect to category management page to show a success message
        return res.status(201).json({ status:true,message: 'Category edited successfully!'});

        
    } catch (error) {
        console.log('error while  editCategory ',error)
        res.redirect('/errorPage');   
        
    }
}


const deleteCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;
        const result = await Category.findById(categoryId);
        if(!result){
            return res.status(404).json({success:false,message:'Category not found'});
        }
        res.status(200).json({success:true,message:'Category deleted successfully'})

    } catch (error) {
        console.log('error while  deleting the category ',error)
        res.redirect('/errorPage');   
        
    }

}

module.exports={
    loadCategoryPage,
    addCategory,
    removeCategoryOffer,
    addCategoryOffer,
    activateCategory,
    inactivateCategory,
    loadEditCategory,
    editCategory,
    deleteCategory
    
}