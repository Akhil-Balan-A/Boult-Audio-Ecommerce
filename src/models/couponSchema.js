const mongoose = require("mongoose");
const {Schema} = mongoose;

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String,
        required:true,
        unique:true
    },
    expiryDate:{
        type:Date, 
        required:true       
    },
    offerPrice:{
        type:Number,
        required:true,
        min:0
    },
    minimumPrice:{
        type:Number,
        required:true,
        min:0
    },
    isListed:{
        type:Boolean,
        default:true
    },
    userId:[{
        type:Schema.types.ObjectId,
        ref:"User"

    }]
    
});

const Coupon = mongoose.model('Coupon',couponSchema);

module.exports = Coupon;