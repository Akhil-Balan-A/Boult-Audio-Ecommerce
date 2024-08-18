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
    endDate:{
        type:Date,
        required:true
    }

},{timestamps:true});

const Banner = mongoose.model('Banner',bannerSchema);

module.exports = Banner;