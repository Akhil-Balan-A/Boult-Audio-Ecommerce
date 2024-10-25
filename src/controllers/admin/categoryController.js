const Category = require('../../models/categorySchema');

const loadCategoryPage = async (req, res) => {
    try {
        // Get the search query for category name, parentCategory, status
        const search = req.query.search || '';
        
        // Set pagination and limit
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;

        // Define the filter object
        const filter = {};

        // Add search filters for name and parentCategory
        if (search) {
            filter.$or = [
                { name: { $regex: ".*" + search + ".*", $options: 'i' } }, // Case-insensitive search for name
                { description: { $regex: ".*" + search + ".*", $options: 'i' } } // Case-insensitive search for description
            ];
            
            // Add parentCategory filter if search matches any parent category
            const categories = ['men', 'women', 'kids'];
            if (categories.includes(search.toLowerCase())) {
                filter.parentCategory = search.toLowerCase();
            }

            // Handle status search as boolean
            if (search.toLowerCase() === 'blocked') {
                filter.status = false; // Show blocked categories
            } else if (search.toLowerCase() === 'unblocked') {
                filter.status = true; // Show unblocked categories
            }
        }

        // Fetch categories based on the filter
        const categoryData = await Category.find(filter)
            .populate('productList')//Populate product list to show products in each category
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .exec();

        // Get the total category count for pagination
        const totalCategories = await Category.countDocuments(filter);
        const totalPages = Math.ceil(totalCategories / limit);

        // Render the page with data and pagination information
        res.render('admin/category', {
            data: categoryData,
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories,
            search,
            limit
        });

    } catch (error) {
        console.log(error);
        res.redirect('/errorPage');
    }
};


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
            status:true

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
    loadCategoryPage,
    addCategory
    
}