const express=require('express')
const { protect } = require('../middleware/auth');
const multer  = require('multer')

// ===================================================Multer =========================================================


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, Date.now() + '_' + file.fieldname + '.' + fileExtension);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'));
    }
  }
});

const upload = multer({ storage: storage })

// =================================================== Multer End =========================================================


// ::::::::::::: Barber's Routers ::::::::::::::::::::::::::::::::::::::
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


// ::::::::::::: Member's Routers ::::::::::::::::::::::::::::::::::::::

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

      
        getRatingPro,
        postRatingPro,
      

        // Deletion & Restriction
        deleteUser,
        deleteBarber,
        // deleteBarberProfile,
        restrictUser,

        // constest 
        contestSet,
        contestUpdate
}=require('../controllers/admin')


// ==================   store

const{
  updateProduct,
  updateStock,
    // e-commerce 

    addProduct,
    getAllProducts,
    getAllOrders,
    getCurrentOrders,
    addToCart,
    addToWishlist,
    createOrder

}=require('../controllers/e-store')

  //Barber Api's routes
  router.post('/register', register);
  router.post('/login', login);
  router.post('/resetpswd', resetPassword);
  router.post('/addnewpswd/:resetToken', addNewPswd);
  router.post('/setBarberPro',upload.single('profilePicture'),protect, setProfileDetails)
  router.post('/setShopDetails',protect, setShopDetails)
  router.post('/setOpen&ClosingTime',protect, setOpenClosetime)
  router.post('/setPrice',protect, setPricing)
  

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
  router.post('/adminSetProf',upload.single('profilePicture'),  adminSetProf)
  router.get('/getActive', getActiveBarbers);
  router.get('/getRegistered', getRegisteredBarbers);
  router.get('/getDigStamCount', getDigitalStampCount);
  router.post('/contestSet', contestSet);
  router.put('/contests/:id', contestUpdate);


  //Ecommerce Api's Routes

router.get("/products", getAllProducts);
router.post("/products", upload.array("photos"), addProduct);
router.post("/products/:product_id", postRatingPro);
router.post("/addToCart", addToCart);
router.post("/wishlist", addToWishlist);
router.post("/orders", createOrder);
router.get("/orders", getAllOrders);
router.get("/orders/current", getCurrentOrders);
router.get("/products/:product_id", getRatingPro);
router.put("/updateProducts/:product_id", updateProduct);
router.put("/updateStocks/:product_id", updateStock);

router.delete("/users/:memberId", deleteUser);
router.delete("/barbers/:BarberId", deleteBarber);
// router.delete("/barbersProfile/:barberProfileId", deleteBarberProfile);
router.put("/users/:userId/restrict", restrictUser);

  module.exports = router;