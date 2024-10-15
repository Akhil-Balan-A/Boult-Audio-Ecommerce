const mongoose = require('mongoose');
const {Schema} = mongoose;


const productSchema = new Schema({
    productName:{
        type:String,
        required:true
    },
    productDescription:{
        type:String,
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    regularPrice:{//price before offer
        type:Number,
        required:true
    },
    salePrice:{ // price after offer 
        type:Number,
        required:true
    },
    productOffer:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        default:0
    },
    productColors:{
        type:[String],
        required:true
    },
    productImages:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:['Available','out of stock','Discontinued'],
        required:true,
        default:'Available'
    }

},{timestamps:true});

const Product = mongoose.model('Product',productSchema);

module.exports = Product;
