const Category = require('../../models/categorySchema');

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

        //validate the inpt fields
        if (!name || !description || !parentCategory ||!categoryOffer) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        //check if the category already exists
        const existingCategory = await Category.findOne({ name});
        if (existingCategory) {
            return res.status(400).json({ message: 'Category name already exists.' });
        }
        const status = req.body.status === 'active'?true:false;
        const categoryOfferNumber = parseFloat(categoryOffer);

        //create a new category object
        const newCategory = new Category({
            name,
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

module.exports={
    loadCategoryPage,
    addCategory
    
}