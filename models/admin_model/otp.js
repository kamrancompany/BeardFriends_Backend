const mongoose=require('mongoose')

const otpSchema = new mongoose.Schema({
    
        email:{type:String},
        code:{type:String},
        expireIn:{type:Number}
       
})


const otpData= mongoose.model('otpSchema', otpSchema)
module.exports = otpData;