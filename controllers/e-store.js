const Product = require("../models/e_commerce/productSchema");
const Order = require("../models/e_commerce/orderSchema");
const User = require("../models/membersmodel/member");
const Cart = require("../models/e_commerce/cart");
const Rating = require("../models/e_commerce/ratingSchema");
const Wishlist = require("../models/e_commerce/wishlist");


// ============================================================Get all products Api's====================================================
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate({ path: 'ratings', options: { strictPopulate: false } });
    // const products = await Product.find()
    res.json(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    // Find the product by its ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the ratings for the product
    const ratings = await Rating.find({ product_id: productId });

    res.status(200).json({ product, ratings });
  } catch (error) {
    console.log(error);
    next(error);
  }
};






// ================================================ Add a new product================================================
exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price, deliveryCharges, freeDelivery, stock } = req.body;
    const photos = req.files.map(file => file.path);

    const product = await Product.create({
      name,
      description,
      price,
      photos,
      deliveryCharges,
      freeDelivery,
      stock,
    });

    console.log(product);
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


//==================================================== Cart code =======================================================

exports.addToCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Check if the user exists and the product is available
    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!user || !product) {
      return res.status(404).json({ message: "User or product not found" });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = await Cart.create({ userId, products: [] });
    }

    // Check if the product is already in the cart
    const existingProduct = cart.products.find((item) => item.productId.equals(productId));
    if (existingProduct) {
      // Increase the quantity if the product is already in the cart
      existingProduct.quantity += quantity;
    } else {
      // Add the product to the cart if it's not already in the cart
      cart.products.push({ productId, quantity });
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


//============================================================= wishlist ===================================================

exports.addToWishlist = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    // Check if the user exists and the product is available
    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!user || !product) {
      return res.status(404).json({ message: "User or product not found" });
    }

    // Check if the product is already in the wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist && wishlist.products.some((item) => item.productId.equals(productId))) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add the product to the wishlist
    if (wishlist) {
      wishlist.products.push({ productId });
      await wishlist.save();
    } else {
      await Wishlist.create({ userId, products: [{ productId }] });
    }

    res.status(200).json({ message: "Product added to wishlist successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


// =========================================================Creating Order==============================================
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, cartId } = req.body;

    // Check if the user and cart exist
    const user = await User.findById(userId);
    const cart = await Cart.findById(cartId).populate("products.productId");
    if (!user || !cart) {
      return res.status(404).json({ message: "User or cart not found" });
    }

    // Create the order
    const orderProducts = cart.products.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
      };
    });

    const totalAmount = cart.products.reduce((total, item) => {
      return total + item.quantity * item.productId.price;
    }, 0);

    const order = await Order.create({
      userId,
      cartId,
      products: orderProducts,
      totalAmount,
    });

    // Clear the cart after creating the order
    cart.products = [];
    await cart.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


// ========================================================= getOrder's ================================================
exports.getSingleOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    // Find the order by its ID
    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.log(error);
    next(error);
  }
};





// ====================================================  update products =========================================
exports.updateProduct = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { name, description, price, deliveryCharges, freeDelivery, stock } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product_id }
      ,
      {
        $set: {
          name,
          description,
          price,
          deliveryCharges,
          freeDelivery,
          stock,
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(updatedProduct);
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================================== update stock ===============================================
exports.updateStock = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { stock } = req.body;

    console.log(product_id);
    const updatedProduct = await Product.findOneAndUpdate({
      _id: product_id
    },
      {
        stock: stock
      },
      {
        new: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(updatedProduct);
    res.status(200).json({ message: "Stock updated successfully", product: updatedProduct });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


//============================================== Get all orders (grouped by year, month, day)=========================================
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(orders);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// ===================================================== Get current orders =================================================
exports.getCurrentOrders = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const orders = await Order.find({ date: { $gte: currentDate } });
    res.json(orders);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

