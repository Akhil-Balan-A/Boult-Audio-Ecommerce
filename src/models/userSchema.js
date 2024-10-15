const mongoose = require("mongoose");
    const {Schema} = mongoose;
const userSchema = new Schema({
    name:{
        type: String,
        required: false,
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
        required:false, 
    },
    phone:{
        type: String,
        required:false,
        unique:true,//need to set true after null is managed in the google signup
        sparse:true,
        default:undefined
    },
    googleId:{
        type:String,
        unique:true
    },
    googleId:{
        type:String,
        unique:true,
    },
    termsAccepted:{
        type:Boolean,
        required:true
    },
    registrationDate:{
        type: Date,
        default:Date.now
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    isBlocked:{
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

