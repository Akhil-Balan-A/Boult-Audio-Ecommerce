const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength:2,
        maxlength:20
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,

    },
    password:{
        type: String,
        required: false,
        
    },
    phone:{
        type: String,
        required: true,
        unique:true,
        sparse:true,
    },
    termsAccepted:{
        type:Boolean,
        required:true
    },
    registrationDate:{
        type: Date,
        default:Date.now
    },
    is_verified:{
        type: Boolean,
        default: false
    },
    is_blocked:{
        type:Boolean,
        default:false  
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    defaultPaymentMethod: {
        type: String,
        enum:['Credit or Debit card', 'Net Banking', 'Stripe', 'Cash on Delivery'],
        default:'Cash on Delivery',
    },
    wallet:{
        type:Number,
        default:0,
    },
    cart:[{
        type:Schema.Types.ObjectId,
        ref:'Cart'
    }],
    wishlist:[{
        type:Schema.Types.ObjectId,
        ref:'Wishlist'
    }],
    orderHistory:[{
        type:Schema.Types.ObjectId,
        ref:'Order'
    }],
    referalCode:{
        type:String,
        // required:true
    },
    redeemed:{
        type:Boolean,
        default:false
    },
    redeemedUsers:[{
        type:Schema.Types.ObjectId,
        ref:"User",
        // required:true
    }],
    searchHistory:[{
        category:{
            type:Schema.Types.ObjectId,
            ref:"Category"
        },
        searchOn:{
            type:Date,
            default:Date.now
        }
    }]

},{timestamps:true});
const User = mongoose.model('User', userSchema);
module.exports = User; 

