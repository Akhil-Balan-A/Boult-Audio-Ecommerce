const User = require('../../models/userSchema');

const customerInfo = async (req, res) => {
    try {
        // Get the search query (for name, email, or phone)
        const search = req.query.search || '';
        
        // Set pagination and limit
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        
        // Set status filter
        let filter = { isAdmin: false };
        const status = req.query.status || 'all';
        if (status === 'blocked') {
            filter.isBlocked = true;
        } else if (status === 'unblocked') {
            filter.isBlocked = false;
        }

        // Add search filters for name, email, and phone number
        if (search) {
            if(search.toLowerCase()==='n/a'){
                filter.$or = [
                    { phone: { $exists: false } }, // No phone field
                    { phone: null } // Phone field is null
                ];
            }else{
                filter.$or = [
                    { name: { $regex: ".*" + search + ".*", $options: 'i' } },  // Case-insensitive search for name
                    { email: { $regex: ".*" + search + ".*", $options: 'i' } }, // Case-insensitive search for email
                    { phone: { $regex: ".*" + search + ".*", $options: 'i' } }  // Case-insensitive search for phone
                ];
            }
            
        }

        // Fetch customers with pagination and filtering
        const customers = await User.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        // Count total customers for pagination
        const count = await User.countDocuments(filter);

        // Render the view with data
        res.render('admin/customers', {
            data: customers,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search, // Pass the search term back to the view
            limit,  // Pass the limit back to the view
            status  // Pass the status filter to the view
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const blockCustomer = async(req,res)=>{
    try {
        let id =req.params.id;
        let page = req.query.page
        await User.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect(`/admin/customers?page=${page}`);
        
    } catch (error) {
        console.log(error);
        res.redirect('/errorPage');
        
    }

}
const unblockCustomer = async(req,res)=>{
    try {
        let id = req.params.id;
        let page = req.query.page || 1;
        await User.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect(`/admin/customers?page=${page}`);
    } catch (error) {
        console.log(error);
        res.redirect('/errorPage');
    }

}






module.exports = {
    customerInfo,
    blockCustomer,
    unblockCustomer

}


