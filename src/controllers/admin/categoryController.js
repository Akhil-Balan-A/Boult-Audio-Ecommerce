const Category = require('../../models/categorySchema');

const categoryInfo = async(req,res)=>{
    try {
        const page = parseInt(req.query.page)||1;
        const limit = 4;
        const skip = (page-1)*limit;

        const categoryData = await Category.find({})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories/limit);
        res.render('admin/category',{
            cat:categoryData,
            currentPage:page,
            totalPages: totalPages,
            totalCategoreis:totalCategories
        })

    } catch (error) {
        console.log(error);
        res.redirect('/errorPage');
        
    }
}

const addCategory = async(req,res)=>{
    try {
        const {name,description,parentCategory,status}=req.body;
        console.log('Received data:', req.body);

        //validate the inpt fields
        if (!name || !description || !parentCategory || typeof status === 'undefined') {
            return res.status(400).json({
                error: "Please provide name, description, parent category, and status."
            });
        }
        //check if the category already exists
        const existingCategory = await Category.findOne({name});
        if(existingCategory){
            return res.status(400).render('admin/add-category',{
                message:"Category already esists. Please choose a different name",
                color:'danger'
            });
        }

        //create a new category object
        const newCategory = new Category({
            name,
            description,
            parentCategory,
            status:status==='true'

        });

        //save the new category to the database.
        await newCategory.save();

        //redirect to category management page to show a success message
        return res.status(200).json({message:"Category added successfully"});
        
    } catch (error) {
         console.error('Error adding category:', error.message);
        res.status(500).json({error:"Internal Swerver Error"});
        
    }

}

module.exports={
    categoryInfo,
    addCategory
    
}