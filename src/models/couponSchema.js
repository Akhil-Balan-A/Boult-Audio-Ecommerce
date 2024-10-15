const mongoose = require("mongoose");
const {Schema} = mongoose;

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String,
        required:true,
        unique:true
    },
    discountType:{
        type:String,
        enum:['fixed','percentage'],
        required:true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0, // Ensure discount value is not negative
    },
    //for tracking the coupon validity
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    usageLimit:{
        type:Number,
        default:1, // Default usage limit can be 1 for single-use coupons
        min:1
    },
    minimumOrderAmount: {
        type: Number,
        default: 0, // Optional minimum order amount to apply the coupon
    },
    category: {
        type: String,
        required: true, // Category for which the coupon is applicable (e.g., "accessories", "smartwatch")
    },
    applicableProducts: {
        type: [String], // Array of product IDs or names where the coupon can be applied
        default: [], // Defaults to an empty array
    },
    isActive: {
        type: Boolean,
        default: true, // Coupon can be activated or deactivated
    },
    status: {
        type: String,
        enum: ['unused', 'used', 'expired'], // Track the coupon status
        default: 'unused', // Default status is 'unused'
    },
    usedDate: { // Date when the coupon was used
        type: Date,
        default: null, // Default to null until used
    },

    userId:[{
        type:Schema.types.ObjectId,
        ref:"User"

    }]
    
});

const Coupon = mongoose.model('Coupon',couponSchema);

module.exports = Coupon;