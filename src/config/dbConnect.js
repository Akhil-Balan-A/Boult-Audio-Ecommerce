const mongoose = require('mongoose');

// MongoDB connection function
const dbConnect = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected Successfully");
    }catch(error){
        console.log('Error connecting to the database',error.message);
        process.exit(1)// Exit the process with failure
    }

};

module.exports = dbConnect;