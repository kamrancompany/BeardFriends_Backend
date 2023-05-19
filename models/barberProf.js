const mongoose=require('mongoose')

const BarberProf = new mongoose.Schema({
        
         name:{
             type:String,
             required:true
         },
         email:{
            type:String,
            required:true
        },
        profilePicture:{
            type:String,
            required:true
        },
        number: {
            type:String,
            required:true
         },
 
})


const barberproff= mongoose.model('BarberProfileData', BarberProf)
module.exports=barberproff;