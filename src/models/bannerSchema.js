const mongoose = require('mongoose');
const {Schema} = mongoose;


const bannerSchema = new mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    link:{
        type:String,
    },
    category: {
        type: String,
        // enum: [add here the categories available], // Enum to limit categories***********************
        required: true,
    },
    startDate: {
        type: Date,
        required: true, // Start date for the banner visibility
    },
    endDate: {
        type: Date,
        required: true, // End date for the banner visibility
    },
    isActive: {
        type: Boolean,
        default: true, // To activate or deactivate the banner
    }

},{timestamps:true});

const Banner = mongoose.model('Banner',bannerSchema);

module.exports = Banner;