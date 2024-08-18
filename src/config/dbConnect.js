const mongoose = require('mongoose');
const dbConnect = ()=>{
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected Successfully");
    }catch(error){
        console.log('DB connection error',error.message);
    }

};


module.exports = dbConnect;