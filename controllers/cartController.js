const Joi = require("joi");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const cartController = {
  // Add product to cart
  async addToCart(req, res, next) {
    // Define validation schema for request body
    const schema = Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    });

    // Validate request body against schema
    const { error } = schema.validate(req.body, { abortEarly: false });

    console.log(error);
    if (error) {
      return next(error);
    }

    try {
      const userId = req.user._id; 
      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ message: "Insufficient stock for this product" });
      }

      // Find cart for the user or create a new one if it doesn't exist
      let cart = await Cart.findOne({ user: userId });

      // Calculate the total price for this product (price * quantity)
      const productTotalPrice = product.price * quantity;

      if (cart) {
        const productIndex = cart.items.findIndex(
          (item) => item.product.toString() === productId
        );

        if (productIndex > -1) {
          cart.items[productIndex].quantity += Number(quantity);
          cart.items[productIndex].totalPrice += Number(productTotalPrice);
      
        } else {
          cart.items.push({
            product: productId,
            quantity,
            totalPrice: productTotalPrice,
          });
        }
      } else {
        cart = new Cart({
          user: userId,
          items: [
            {
              product: productId,
              quantity,
              totalPrice: productTotalPrice,
            },
          ],
        });
      }

      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.totalPrice,
        0
      );

      product.stock -= Number(quantity);
      await product.save();
      // Save the updated cart
      await cart.save();

      // Send response with success message and updated cart
      res.status(200).json({ message: "Product added to cart", cart });
    } catch (err) {
      next(err); // Pass any other errors to the next middleware
    }
  },

  // Get user's cart
  async getCart(req, res, next) {
    try {
      const userId = req.user._id;

      // Find the cart for the user
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
        "name price"
      );

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      res.status(200).json(cart);
    } catch (err) {
      next(err);
    }
  },

  // Update product quantity in the cart
  async updateCart(req, res, next) {
    const schema = Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(error);
    }

    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found in cart" });
      }


      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ message: "Insufficient stock for this product" });
      }

      if(Number(quantity)==0){
        cart.items.splice(productIndex, 1);
      }


      
      else{

         
          let productPrice = Number(quantity) * product.price;
          product.stock += cart.items[productIndex].quantity;
          cart.items[productIndex].quantity = quantity;
          cart.items[productIndex].totalPrice = productPrice;
          product.stock -= Number(quantity);
        }


      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.totalPrice,
        0
      );

       await product.save();  
      await cart.save();

      res.status(200).json({ message: "Cart updated successfully", cart });
    } catch (err) {
      next(err); // Pass any other errors to the next middleware
    }
  },

  // Remove product from cart
  async removeFromCart(req, res, next) {
    // Define schema for validation using Joi
    const schema = Joi.object({
      productId: Joi.string().required(),
    });

    // Validate request body
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(error); // Pass the error to the next middleware
    }

    try {
      const userId = req.user._id;
      const { productId } = req.body;

      // Find the cart for the user
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Find the product in the cart
      const productIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found in cart" });
      }

      // Remove the product from the cart
      cart.items.splice(productIndex, 1);
      await cart.save();

      res.status(200).json({ message: "Product removed from cart", cart });
    } catch (err) {
      next(err); // Pass any other errors to the next middleware
    }
  },

  // Clear the cart (empty the cart)
  async clearCart(req, res, next) {
    try {
      const userId = req.user._id;

      // Find and remove the cart for the user
      await Cart.findOneAndDelete({ user: userId });

      res.status(200).json({ message: "Cart cleared successfully" });
    } catch (err) {
      next(err); // Pass any other errors to the next middleware
    }
  },
};

module.exports = cartController;
