const Category = require('../models/categoryModel');
const {ServiceSchema,categorySchema,ratingSchema} = require('../models/serviceModel');
const {serviceItemSchema,validateServiceItem} = require('../models/serviceItemsModel');
exports.addService = async (req, res) => {
    try{
        if(!req.user==='superadmin'|| !req.user==='admin'){
            return res.status(403).json({ message: 'Access denied' });
        }
        const { name, description, categoryId,companyId,price,coverimage,serviceimage,canbook } = req.body;
        const { error } = validateServiceItem(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const serviceItem = new Service({
            name,
            description,
            categoryId,
            companyId,
            price,
            coverimage,
            serviceimage,
            canbook 
        });
        await serviceItem.save();
        res.status(201).json({ message: 'Service item added successfully', serviceItem });
    }catch (error) {
        console.error('Error adding service item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.addCategory = async (req, res) => {
    try{   
        if(!req.user==='superadmin'){
            return res.status(403).json({ message: 'Access denied' });
        } 
        const { maincategory, mainphoto,subcategory,subphoto } = req.body;
        const { error } = validateCategory(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const category = new Category({
            maincategory,
            mainphoto,
            subcategory,
            subphoto
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
exports.getallsubcategories = async (req, res) => {
    try {
        const { maincategory } = req.body;
        if (!maincategory) {
            return res.status(400).json({ message: 'Main category is required' });
        }
        const categories = await Category.findOne({ maincategory });
        if (categories.length === 0) {
            return res.status(404).json({ message: 'No subcategories found for this main category' });
        }
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getserviceByCategory = async (req, res) => {
    try {
        const { categoryId } =req.body;
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }
        const services = await ServiceSchema.findById({ categoryId }).populate
        ('categoryId', 'maincategory subcategory mainphoto subphoto');
        if (services.length === 0) {
            return res.status(404).json({ message: 'No services found for this category' });
        }
        res.status(200).json(services);

    }catch (error) {
        console.error('Error fetching services by category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
