const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    uploaded: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    category_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Image
 */
const Image = mongoose.model('image', ImageSchema);

module.exports = Image;