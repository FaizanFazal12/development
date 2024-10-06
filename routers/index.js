const auth = require("../middlewares/auth");
const express = require('express');

const authController = require('../controllers/authController');
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const router = express.Router();


router.post('/login', authController.LoginUser);

router.post('/register', authController.SignupUser);

router.route('/categories')
    .post(auth, categoryController.createCategory)  // Create a new category
    .get(auth, categoryController.getAllCategories);  // Get all categories

router.route('/categories/:id')
    .get(auth, categoryController.getCategoryById)   // Get a category by ID
    .put(auth, categoryController.updateCategory)    // Update a category by ID
    .delete(auth, categoryController.deleteCategory);  // Delete a category by ID

router.route('/products')
    .post(auth, productController.createProduct)  // Create a new category
    .get(auth, productController.getAllProducts);  // Get all categories

router.route('/products/:id')
    .get(auth, productController.getProductById)   // Get a category by ID
    .put(auth, productController.updateProduct)    // Update a category by ID
    .delete(auth, productController.deleteProduct);  // Delete a category by ID

router.route('/products')
    .post(auth, productController.createProduct)  // Create a new category
    .get(auth, productController.getAllProducts);  // Get all categories

router.route('/products/:id')
    .get(auth, productController.getProductById)   // Get a category by ID
    .put(auth, productController.updateProduct)    // Update a category by ID
    .delete(auth, productController.deleteProduct);  // Delete a category by ID



router.route('/cart')
    .get(auth, cartController.getCart)
    .post(auth, cartController.addToCart)
    .put(auth, cartController.updateCart);

 // Route to remove a product from the cart
router.delete('/cart/product/remove', auth, cartController.removeFromCart);

// Route to clear the entire cart
router.delete('/cart/clear', auth, cartController.clearCart);



// Routes for orders
router.route('/orders')
  .get(auth, orderController.getUserOrders)  // Get all orders for the user
  .post(auth, orderController.placeOrder);   // Place an order

router.route('/orders/:orderId')
  .get(auth, orderController.getOrderById)   // Get specific order by ID
  .put(auth, orderController.updateOrderStatus) // Update order status
  .delete(auth, orderController.deleteOrder);  // Delete an order



module.exports = router