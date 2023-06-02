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
        getAllRatings,
        postRatingPro,
      

        // Deletion & Restriction
        deleteUser,
        deleteBarber,
       
        blockBarber,
        unblockBarber,
        blockMember,
        unblockMember,

        // constest 
        contestSet,
        contestUpdate,
        getContest,
        addStaff,
        setPasswordStaff

}=require('../controllers/admin')


// ==================   store

const{
  updateProduct,
  updateStock,
    // e-commerce 

   
    getAllOrders,
    getCurrentOrders,

    addProduct,
    getAllProducts,
    getSingleProduct,
    addToCart,
    addToWishlist,
    createOrder,
    getSingleOrderDetails

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
  router.post('/addStaff/', addStaff);
  router.post('/adminSetProf',upload.single('profilePicture'), adminSetProf)
  router.get('/getActive', getActiveBarbers);
  router.get('/getRegistered', getRegisteredBarbers);
  router.get('/getDigStamCount', getDigitalStampCount);
  router.post('/contestSet', contestSet);
  router.get('/contest', getContest);
  router.put('/contests/:id', contestUpdate);

  // block or restrict user
  router.put('/blockMember/:userId', blockMember);
  router.put('/unblockMember/:userId', unblockMember);  
  
  router.put('/blockBarber/:userId', blockBarber);
  router.put('/unblockBarber/:userId', unblockBarber);

  router.post('/staff/set-password', setPasswordStaff);

  //Ecommerce Api's Routes

router.get("/products", getAllProducts);
router.post("/products", upload.array("photos"), addProduct);
router.post("/products/:product_id", postRatingPro);
router.post("/addToCart", addToCart);
router.post("/wishlist", addToWishlist);
router.post("/orders", createOrder);
router.get("/orders", getAllOrders);
router.get("/products/:productId", getSingleProduct);


router.get("/ordersDetail/:orderId", getSingleOrderDetails);

router.get("/orders/current", getCurrentOrders);
router.get("/productRating/:product_id", getRatingPro);
router.get('/ratings/:product_id',getAllRatings);

router.put("/updateProducts/:product_id", updateProduct);
router.put("/updateStocks/:product_id", updateStock);

router.delete("/users/:memberId", deleteUser);
router.delete("/barbers/:BarberId", deleteBarber);
// router.delete("/barbersProfile/:barberProfileId", deleteBarberProfile);
// router.put("/users/:userId/restrict", restrictUser);

  module.exports = router;