const mongoose = require('mongoose');
const Category = require('../Models/categoryModel');
const Service = require('../Models/serviceModel');
const { validateCategory } = require('../validators/categoryValidator');

exports.addCategory = async (req, res) => {
  try {
    const { category } = req.body;

    const { error } = validateCategory(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const newCategory = new Category({
      category,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await newCategory.save();
    res.status(201).json({ message: 'Category added successfully', category: newCategory });

  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ message: 'Category ID is required' });

    const services = await Service.find({ categoryId }).populate('categoryId');
    if (!services.length) return res.status(404).json({ message: 'No services found for this category' });

    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) return res.status(400).json({ message: 'Service ID is required' });

    const service = await Service.findById(serviceId).populate('categoryId');
    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.ShowRandomCategoriesWithServices = async (req, res) => {
  try {
    const randomCategories = await Category.aggregate([{ $sample: { size: 6 } }]);

    if (!randomCategories.length) return res.status(404).json({ message: 'No categories found' });

    const categoriesWithServices = await Promise.all(
      randomCategories.map(async (category) => {
        const services = await Service.aggregate([
          { $match: { categoryId: new mongoose.Types.ObjectId(category._id) } },
          { $sample: { size: 6 } }
        ]);
        return { category, services };
      })
    );

    res.status(200).json(categoriesWithServices);
  } catch (error) {
    console.error('Error fetching random categories and services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedData = req.body;

    const { error } = validateCategory(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    if (req.file) {
      updatedData.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updatedData },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ message: 'Category ID is required' });

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.addSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = new Subcategory({
      name,
      categoryId
    });

    await subcategory.save();
    res.status(201).json({ message: "Subcategory added", subcategory });
  } catch (error) {
    console.error("Error adding subcategory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ categoryId });

    res.status(200).json(subcategories);
  } catch (err) {
    console.error('Get subcategories error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.searchSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { keyword } = req.body;

    const subcategories = await Subcategory.find({
      categoryId,
      name: { $regex: keyword, $options: 'i' }
    });

    res.status(200).json(subcategories);
  } catch (err) {
    console.error('Search subcategories error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updateSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const { name } = req.body;

    const updated = await Subcategory.findByIdAndUpdate(
      subcategoryId,
      { $set: { name } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    res.status(200).json({ message: 'Subcategory updated successfully', updated });
  } catch (err) {
    console.error('Update subcategory error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.deleteSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const deleted = await Subcategory.findByIdAndDelete(subcategoryId);

    if (!deleted) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (err) {
    console.error('Delete subcategory error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};