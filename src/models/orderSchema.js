const mongoose = require('mongoose');
const {Schema} = mongoose;
const {v4:uuidv4} = require('uuid');


const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        default:()=>uuidv4(),
        unique:true,
    },
    orderedItem:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            min:1
        },
        price:{
            type:Number,
            default:0,
            required:true,
            min:0
        }
    }],
    totalPrice:{
        type:Number,
        required:true,
        min:0
    },
    discount:{
        type:Number,
        default:0,
        min:0
    },
    finalPrice:{
        type:Number,
        required:true,
        min:0
    },
    address:{
        type:Schema.Types.ObjectId,
        ref:'Address',
        required:true
    },
    invoiceDate:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        required:true,
        enum:["Pending","Processing","Shipped","Delivered","Cancelled","Return Request","Returned"],
        default:"Pending"
    },
    couponApplied:{
        type:Boolean,
        default:false
    },
    cancelledDate: {
        type: Date,
    },
    shippingCharges: {
        type: Number,
        default: 0,
        min:0
    }

},{timestamps:true});

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;