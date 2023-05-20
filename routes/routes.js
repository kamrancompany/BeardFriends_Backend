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
  


// ::::::::::::: Admin Routers::::::::::::::::::::::::::::::::::::::

const {
  adminRegister,
  adminLogin,
  adminForgetPswd,
  adminResetPswd,
  adminSetProf,
  getActiveBarbers,
  getRegisteredBarbers,
  getDigitalStampCount,

  // e-commerce 

  addProduct,
  getAllProducts,
  getAllOrders,
  getCurrentOrders
}=require('../controllers/admin')


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

  //Admin Api's routes
  router.post('/adminRegister', adminRegister);
  router.post('/adminLogin', adminLogin);
  router.post('/adminForgetPswd', adminForgetPswd);
  router.post('/adminResetPswd/:resetToken', adminResetPswd);
  router.post('/adminSetProf',upload.single('profilePicture'), adminSetProf)
  router.get('/getActive', getActiveBarbers);
  router.get('/getRegistered', getRegisteredBarbers);
  router.get('/getDigStamCount', getDigitalStampCount);


  //Ecommerce Api's Routes

router.get("/products", getAllProducts);
router.post("/products", upload.array("photos"), addProduct);
router.get("/orders", getAllOrders);
router.get("/orders/current", getCurrentOrders);

  module.exports = router;