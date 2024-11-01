const mongoose = require('mongoose');
const {Schema} = mongoose;


const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
        trim:true
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
    salesPriceAfterCategoryOfferIfAny:{//net sales price after category offer
        type:Number,
        required:true
    },
    productOffer:{// offer as per the occation or festivals or year end sales etc
        type:Number,
        default:0
    },
    stock:{
        type:Number,
        default:0,
        min:0// Prevents negative stock
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
