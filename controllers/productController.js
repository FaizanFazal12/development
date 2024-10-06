const Product = require('../models/Product'); 
const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;


const productController = {
  // Create a new product
  async createProduct(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      description: Joi.string().optional(),
      image: Joi.string().optional(),
      category: Joi.string().pattern(objectIdPattern).required()
    });

    const { error } = schema.validate(req.body ,{ abortEarly:true});
    if (error) {
      return next(error);
    }

    try {
      const { name, description , category ,image } = req.body;

      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product already exists' });
      }

      const newProduct = new Product({ name, description ,category ,image });
      await newProduct.save();

      res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
      next(err); 
    }
  },

  // Get a list of all products
  async getAllProducts(req, res, next) {
    try {
      const products = await Product.find();
      res.status(200).json({ success: true, products });
    } catch (err) {
      next(err);
    }
  },

  // Get a single product by ID
  async getProductById(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ success: true, product });
    } catch (err) {
      next(err);
    }
  },

  // Update a product by ID
  async updateProduct(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(3).optional(),
      description: Joi.string().optional(),
      image: Joi.string().optional(),
      category: Joi.string().pattern(objectIdPattern).optional()

    });

    const { error } = schema.validate(req.body ,{ abortEarly:true});
    if (error) {
      return next(error);
    }

    try {
      const { name, description ,category ,image } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { name, description ,category },
        { new: true } 
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
      next(err);
    }
  },

  // Delete a product by ID
  async deleteProduct(req, res, next) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productController;
