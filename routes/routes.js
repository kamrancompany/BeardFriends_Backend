const express=require('express')
const { protect } = require('../middleware/auth');
const multer  = require('multer')

// ===================================================Multer =========================================================


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null,Date.now() + file.fieldname)
  }
})

const upload = multer({ storage: storage })

// =================================================== Multer End =========================================================


// ::::::::::::: Barber's Routers::::::::::::::::::::::::::::::::::::::
const router=express.Router()
const {
    register,
    login,
    resetPassword,
    addNewPswd,
    setProfileDetails,
    setShopDetails,
    setOpenClosetime,
    setPricing
  
  } = require('../controllers/barbercontroller');


// ::::::::::::: Member's Routers::::::::::::::::::::::::::::::::::::::

  const {
    registerMember,
    loginMember,
    forgetPassMember,
    addNewPswdMember,
  }=require('../controllers/members')
  

  //Barber Api's routes
  router.post('/register', register);
  router.post('/login', login);
  router.post('/resetpswd', resetPassword);
  router.post('/addnewpswd/:resetToken', addNewPswd);
  router.post('/setBarberPro',upload.single('profilePicture'), setProfileDetails)
  router.post('/setShopDetails', setShopDetails)
  router.post('/setOpen&ClosingTime', setOpenClosetime)
  router.post('/setPrice', setPricing)
  

  //Member Api's routes
  router.post('/registerMember', registerMember);
  router.post('/loginMember', loginMember);
  router.post('/forgetPassMember', forgetPassMember);
  router.post('/addnewpswdMember/:resetToken', addNewPswdMember);

  module.exports = router;