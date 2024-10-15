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
        },
        itemStatus:{//item wise status
            type:String,
            required:true,
            enum:["Processing","Order Confirmed","Shipped","Delivered","Cancelled","Return Request","Returned"],//once payment confirmed the order will become confirmed
            default:"Processing"
        },
        itemCancelledDate: {//itemwise cancel date
            type: Date
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
    orderStatus:{//entire ordewise status
        type:String,
        required:true,
        enum:["Processing","Order Confirmed","Shipped","Delivered","Cancelled","Return Request","Returned"],//once payment confirmed the order will become confirmed
        default:"Processing"
    },
    couponApplied:{
        type:Boolean,
        default:false
    },
    orderCancelledDate: {//entire ordewise cancel date
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