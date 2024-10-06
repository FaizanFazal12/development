const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    brand: {
      type: String
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    images: [
      {
        type: String
      }
    ],
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true },
        comment: { type: String }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Product = mongoose.model('Product', productSchema);
  module.exports = Product;
  