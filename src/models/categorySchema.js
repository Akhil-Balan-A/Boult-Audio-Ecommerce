const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    parentCategory:{
        type:String,
        required:true,
        enum:['men','women','kids']//restricted to specific options
    },
    description:{
        type:String,
        required:true
    },
    productList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product" // 
    }],
    status:{
        type:Boolean,
        default:true
    },
    categoryOffer:{
        type:Number,
        default:0
    },


    
},{timestamps:true});

const Category = mongoose.model('Category',categorySchema);

module.exports = Category;