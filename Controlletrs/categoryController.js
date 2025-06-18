const Category = require('../models/categoryModel');

exports.addCategory = async (req, res) => {
    try{   
        const { category, photo,subcategory} = req.body;
        const { error } = validateCategory(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const newcategory = new Category({
            category,
            photo,
            subcategory
        });
        await category.save();
        res.status(201).json({ message: 'Category added successfully', category });

    }catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getserviceByCategory = async (req, res) => {
    try {
        const { categoryId } =req.body;
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }
        const services = await ServiceSchema.findById( categoryId ).populate
        ('categoryId', 'maincategory subcategory mainphoto');
        if (services.length === 0) {
            return res.status(404).json({ message: 'No services found for this category' });
        }
        res.status(200).json(services);

    }catch (error) {
        console.error('Error fetching services by category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getServiceById = async (req, res) => {
    try {
        const { serviceId } = req.body;
        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required' });
        }
        const service = await ServiceSchema.findById(serviceId).populate('categoryId', 'category subcategory photo ');
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        console.error('Error fetching service by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.ShowRandomCategoriesWithServices = async (req, res) => {
  try {
    const randomCategories = await Category.aggregate([{ $sample: { size: 6 } }]);
    if (!randomCategories.length) {
      return res.status(404).json({ message: 'No categories found' });
    }
    const categoriesWithServices = await Promise.all(
      randomCategories.map(async (category) => {
        const services = await Service.aggregate([
          { $match: { categoryId: new mongoose.Types.ObjectId(category._id) } },
          { $sample: { size: 6 } }
        ]);

        return {
          category,
          services
        };
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
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });

        const category = await Category.findByIdAndUpdate(categoryId, 
            { $set: { ...updatedData } }, { new: true });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}