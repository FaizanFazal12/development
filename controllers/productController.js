const Product = require('../models/Product'); 
const Category = require('../models/Category'); 
const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const productController = {
  // Create a new product
  async createProduct(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      price: Joi.string().required(),
      brand: Joi.string().required(),
      stock: Joi.string().optional(),
      description: Joi.string().required(),
      images: Joi.array().items(Joi.string()).optional(),
      category: Joi.string().pattern(objectIdPattern).optional()
    });

    const { error } = schema.validate(req.body ,{ abortEarly:true} );
    if (error) {
      return next(error);
    }

    try {
      const { name, description , category ,image ,price  ,brand ,stock} = req.body;

      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product already exists' });
      }

      const newProduct = new Product({ name, description ,category ,image  ,price ,brand ,stock});
      await newProduct.save();

      res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
      next(err); 
    }
  },

  // Get a list of all products with filters, sorting, and price range
  async getAllProducts(req, res, next) {
    try {
      const { brand, category, minPrice, maxPrice, stock, sort, sortDirection } = req.query;
      
      // Create a filter object based on the query parameters
      let filter = {};

      // Filtering logic
      if (brand) {
        filter.brand = brand;
      }

      if (category) {

        let findCategory= await Category.findOne({ name:category} );
        if(findCategory){

          filter.category = findCategory._id;
        }
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      if (stock) {
        filter.stock = stock;
      }

      // Default sort criteria
      let sortCriteria = {};
      if (sort) {
        const direction = sortDirection === 'desc' ? -1 : 1;
        sortCriteria[sort] = direction;
      }

      // Fetch products with the filter and sorting applied
      const products = await Product.find(filter).sort(sortCriteria);

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
      price: Joi.string().optional(),
      brand: Joi.string().optional(),
      stock: Joi.string().optional(),
      description: Joi.string().optional(),
      images: Joi.array().items(Joi.string()).optional(),
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
