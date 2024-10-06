const Joi = require('joi');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartController = {
    // Add product to cart
    async addToCart(req, res, next) {
        // Define schema for validation using Joi
        const schema = Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
        });

        // Validate request body
        const { error } = schema.validate(req.body, { abortEarly: true });
        if (error) {
            return next(error); // Pass the error to the next middleware
        }

        try {
            const userId = req.user._id;
            const { productId, quantity } = req.body;

            // Validate product existence
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Check if cart already exists for the user
            let cart = await Cart.findOne({ user: userId });

            if (cart) {
                // If cart exists, check if the product is already in the cart
                const productIndex = cart.items.findIndex(item => item.product.toString() === productId);

                if (productIndex > -1) {
                    // If product exists in the cart, update the quantity
                    cart.items[productIndex].quantity += quantity;
                } else {
                    // If product does not exist, add it to the cart
                    cart.items.push({ product: productId, quantity });
                }
            } else {
                // If no cart exists, create a new cart for the user
                cart = new Cart({
                    user: userId,
                    items: [{ product: productId, quantity }]
                });
            }

            await cart.save();
            res.status(200).json({ message: 'Product added to cart', cart });
        } catch (err) {
            next(err); // Pass any other errors to the next middleware
        }
    },

    // Get user's cart
    async getCart(req, res, next) {
        try {
            const userId = req.user._id;

            // Find the cart for the user
            const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price');

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            res.status(200).json(cart);
        } catch (err) {
            next(err); // Pass any other errors to the next middleware
        }
    },

    // Update product quantity in the cart
    async updateCart(req, res, next) {
        const schema = Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
        });

        const { error } = schema.validate(req.body, { abortEarly: true });
        if (error) {
            return next(error);
        }

        try {
            const userId = req.user._id;
            const { productId, quantity } = req.body;

            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const productIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            cart.items[productIndex].quantity = quantity;
            await cart.save();

            res.status(200).json({ message: 'Cart updated successfully', cart });
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
        const { error } = schema.validate(req.body, { abortEarly: true });
        if (error) {
            return next(error); // Pass the error to the next middleware
        }

        try {
            const userId = req.user._id;
            const { productId } = req.body;

            // Find the cart for the user
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Find the product in the cart
            const productIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            // Remove the product from the cart
            cart.items.splice(productIndex, 1);
            await cart.save();

            res.status(200).json({ message: 'Product removed from cart', cart });
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

            res.status(200).json({ message: 'Cart cleared successfully' });
        } catch (err) {
            next(err); // Pass any other errors to the next middleware
        }
    }
};

module.exports = cartController;
