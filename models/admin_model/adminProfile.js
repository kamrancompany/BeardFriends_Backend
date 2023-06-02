const mongoose=require('mongoose')

const AdminProfSchema = new mongoose.Schema({
    
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
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
       
 
})


const AdminProf= mongoose.model('AdminProfileData', AdminProfSchema)
module.exports=AdminProf;