const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId:{
        type: Number,
        unique: true,
        required:true,
        default:1000000000,
        minlength:10
    },
    firstName:{
        type: String,
        required: true,
        minlength:2,
        maxlength:20
    },
    lastName:{
        type: String,
        required: true,
        minlength:2,
        maxlength:20
    },
    userName:{
        type: String,
        minlength:4,
        maxlength:20,
        required:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        // match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },
    password:{
        type: String,
        required: true,
        minlength:10
    },
   
    
    phoneNumber:{
        type: String,
        required: true,
        
    },
    
    registrationDate:{
        type: Date,
        required:true
    },
  
    is_verified:{
        type: Boolean,
        default: false
    },
    token:{
        type:String,
        default:''
    },
    is_blocked:{
        type:Boolean,
        default:false
        
    },
    defaultPaymentMethod: {
        type: String,
        enum:['Credit or Debit card', 'Net Banking', 'Stripe', 'Cash on Delivery'],
        default:'Cash on Delivery',
    

    },
    rememberToken: 
    { type: String },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    }],

    
},{timestamps:true});

module.exports = mongoose.model('Users', userSchema);

