const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String }
      }
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      required: true
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String
    },
    totalPrice: {
      type: Number,
      required: true
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;
  