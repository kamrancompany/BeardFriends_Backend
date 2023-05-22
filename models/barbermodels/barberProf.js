const mongoose=require('mongoose')

const BarberProf = new mongoose.Schema({
    
    barberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barbers',
        required: true
      },
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
         isActive: {
            type: Boolean,
            default: false,
          },
 
})


const barberproff= mongoose.model('BarberProfileData', BarberProf)
module.exports=barberproff;