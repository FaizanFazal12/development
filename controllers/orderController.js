const Order = require('../models/Order');
const Cart = require('../models/Cart'); 
const Product = require('../models/Product'); 
const Joi = require('joi');

const orderController = {
  // Place an order
  async placeOrder(req, res, next) {
    const userId = req.user._id; 

    const schema = Joi.object({
      shippingAddress: Joi.object({
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required()
      }).required(),
      paymentMethod: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price stock image');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty. Cannot place an order.' });
      }

      const itemsOutOfStock = cart.items.filter(item => item.product.stock < item.quantity);
      if (itemsOutOfStock.length > 0) {
        return res.status(400).json({
          message: 'Some items are out of stock',
          items: itemsOutOfStock.map(item => ({ product: item.product.name, availableStock: item.product.stock }))
        });
      }

      const order = new Order({
        user: userId,
        orderItems: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image // Added product image to order items
        })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        totalPrice: cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0)
      });

      const savedOrder = await order.save();

      for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        product.stock -= item.quantity;
        await product.save();
      }

      await Cart.findOneAndDelete({ user: userId });

      res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
    } catch (err) {
      next(err);
    }
  },

  async getUserOrders(req, res, next) {
    const userId = req.user._id;

    try {
      const orders = await Order.find({ user: userId }).populate('items.product', 'name price');
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }

      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  },

  // Get a specific order by ID
  async getOrderById(req, res, next) {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId).populate('items.product', 'name price');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  },

  // Update order status (e.g., to "Shipped", "Delivered", etc.)
  async updateOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validation for status (optional)
    const schema = Joi.object({
      status: Joi.string().valid('Pending', 'Shipped', 'Delivered', 'Cancelled').required()
    });

    const { error } = schema.validate({ status });
    if (error) {
      return next(error);
    }

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = status;
      await order.save();

      res.status(200).json({ message: 'Order status updated', order });
    } catch (err) {
      next(err);
    }
  },

  // Delete an order (for admin or user who placed the order)
  async deleteOrder(req, res, next) {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.remove();
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = orderController;
