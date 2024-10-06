const Category = require('../models/Category'); 
const Joi = require('joi');

const categoryController = {
  // Create a new category
  async createCategory(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      description: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      const { name, description } = req.body;

      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const newCategory = new Category({ name, description });
      await newCategory.save();

      res.status(201).json({ message: 'Category created successfully', category: newCategory });
    } catch (err) {
      next(err); 
    }
  },

  // Get a list of all categories
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.find();
      res.status(200).json({ success: true, categories });
    } catch (err) {
      next(err);
    }
  },

  // Get a single category by ID
  async getCategoryById(req, res, next) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json({ success: true, category });
    } catch (err) {
      next(err);
    }
  },

  // Update a category by ID
  async updateCategory(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(3).optional(),
      description: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      const { name, description } = req.body;

      // Find the category by ID and update it
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true } // Return the updated document
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (err) {
      next(err);
    }
  },

  // Delete a category by ID
  async deleteCategory(req, res, next) {
    try {
      const deletedCategory = await Category.findByIdAndDelete(req.params.id);

      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = categoryController;
