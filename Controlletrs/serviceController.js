const Category = require('../Models/categoryModel');
const Invite = require('../Models/inviteLinkModel');
const Service = require('../Models/serviceModel');
const ServiceItem = require('../Models/serviceItemsModels');
const SubCategory=require('../Models/subCategoryModel');
const crypto = require('crypto');
  exports.addService = async (req, res) => {
  try {
    const { role, _id: userId, companyId } = req.user;

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      description,
      categoryId,
      price,
      coverimage,
      serviceimage,
      canbook,
      companyId: bodyCompanyId // from req.body (only valid if superadmin sends it)
    } = req.body;

    const effectiveCompanyId = role === 'superadmin' ? bodyCompanyId : companyId;

    // Validate input
    const { error } = validateServiceItem({
      name,
      description,
      categoryId,
      price,
      companyId: effectiveCompanyId,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const service = new Service({
      name,
      description,
      categoryId,
      companyId: effectiveCompanyId,
      price,
      coverimage,
      serviceimage,
      canbook
    });

    await service.save();

    res.status(201).json({ message: 'Service  added successfully', serviceItem });
  } catch (error) {
    console.error('Error adding service :', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
exports.GenerateinviteLink = async (req, res) => {try {
    const userId = req.user.id;
    const domain = req.body.domain;
    const token = crypto.randomBytes(6).toString('hex');
    const invite = new Invite({
      token,
      invitedBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await invite.save();

    const inviteUrl = `${domain}/${token}`;
    res.status(201).json({ inviteUrl,token });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate invite' });
  }
};
exports.useInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({ token });

    if (!invite || invite.used || invite.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired invite' });
    }
    invite.used = true;
    await invite.save();
    res.status(200).json({ message: 'Invite accepted, continue registration' });
  } catch (err) {
    res.status(500).json({ message: 'Error using invite' });
  }
};
exports.updateService = async (req, res) => {
  try {
    const { role, companyId } = req.user;
    const { serviceId } = req.params;
    const updatedData = req.body;

    // Validate input
    const { error } = validateServiceItem(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Remove undefined fields
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    // Find service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service item not found' });
    }

    // Admins can update only their own company's services
    if (role === 'admin' && service.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ message: 'Access denied: You can only update your company services.' });
    }

    // Update
    const updated = await Service.findByIdAndUpdate(
      serviceId,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).json({ message: 'Service item updated successfully', service: updated });

  } catch (error) {
    console.error('Error updating service item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.deleteService = async (req, res) => {
  try {
    const { role, companyId } = req.user;
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service  not found' });
    }
    if (role === 'admin' && service.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ message: 'Access denied: You can only delete your company services.' });
    }

    await ServiceSchema.findByIdAndDelete(serviceId);

    res.status(200).json({ message: 'Service  deleted successfully' });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.rate = async (req, res) => {
  try {
    const { rating } = req.body;
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const existingRating = service.ratings.find(r => r.userId.toString() === req.user._id.toString());
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      service.ratings.push({ userId: req.user._id, rating });
    }

    const averageRating = service.ratings.reduce((acc, r) => acc + r.rating, 0) / service.ratings.length;
    service.rating = averageRating;
    service.ratingCount = service.ratings.length;

    await service.save();

    res.status(200).json({ message: 'Rating updated successfully', rating: averageRating });

  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
    exports.getServiceRating = async (req, res) => {
    try {
        const { serviceId } = req.params;
        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required' });
        }
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ rating: service.rating, ratings: service.ratings });
    } catch (error) {
        console.error('Error fetching service rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getTopBrandsByOffer = async (req, res) => {
  try {
    const topServices = await Service.find({ offerpercentage: { $gt: 0 } })
      .sort({ offerpercentage: -1 })
      .limit(10) 
      .populate('categoryId', 'category')
      .select('name offerpercentage coverimage serviceImage');

    if (!topServices.length) {
      return res.status(404).json({ message: 'No services with offers found.' });
    }

    res.status(200).json({ topBrands: topServices });
  } catch (error) {
    console.error('Error fetching top brands:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.fromCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const currentUserCompanyId = req.user.companyId;
    const subcategories = await SubCategory.find({ categoryId });
    const subcategoryIds = subcategories.map(sub => sub._id);
    const services = await Service.find({
      subcategoryId: { $in: subcategoryIds },
      companyId: { $ne: currentUserCompanyId }
    });

    const serviceIds = services.map(s => s._id);
    const serviceItems = await ServiceItem.find({ serviceId: { $in: serviceIds } });
    const response = subcategories.map(sub => ({
      _id: sub._id,
      name: sub.name,
      services: services
        .filter(service => service.subcategoryId.toString() === sub._id.toString())
        .map(service => ({
          _id: service._id,
          name: service.name,
          serviceItems: serviceItems.filter(
            item => item.serviceId.toString() === service._id.toString()
          )
        }))
    }));

    res.status(200).json({ categoryId, subcategories: response });
  } catch (error) {
    console.error('Error fetching filtered services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
