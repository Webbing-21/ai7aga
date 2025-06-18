const Category = require('../models/categoryModel');
const {ServiceSchema,categorySchema,ratingSchema} = require('../models/serviceModel');
const Invite = require('../Models/inviteLinkModel');
const crypto = require('crypto');
exports.addService = async (req, res) => {
    try{
        const { name, description, categoryId,companyId,price,coverimage,serviceimage,canbook } = req.body;

        const { error } = validateServiceItem({
            name:req.body.name,
            description:req.body.description,
            categoryId:req.body.categoryId,
            companyId:req.body.companyId,
            price:req.body.price,
            
        });
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
        const { serviceId }  = req.params;
        const updateddata = req.body;

        const { error } = validateServiceItem(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        Object.keys(updateddata).forEach(key => {
            if (updateddata[key] === undefined) {
                delete updateddata[key];
            }
        });

        const serviceItem = await ServiceSchema.findByIdAndUpdate(serviceId,
           { $set: {...updateddata}
        }, { new: true });

        if (!serviceItem) {
            return res.status(404).json({ message: 'Service item not found' });
        }

        res.status(200).json({ message: 'Service item updated successfully', serviceItem });
    } catch (error) {
        console.error('Error updating service item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteService = async (req, res) => {
    try {
        const { serviceId } = req.body;
        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required' });
        }

        const serviceItem = await ServiceSchema.findByIdAndDelete(serviceId);
        if (!serviceItem) {
            return res.status(404).json({ message: 'Service item not found' });
        }

        res.status(200).json({ message: 'Service item deleted successfully' });
    } catch (error) {
        console.error('Error deleting service item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
eexports.rate = async (req, res) => {
  try {
    const { rating } = req.body;
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const service = await ServiceSchema.findById(serviceId);
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
        const service = await ServiceSchema.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ rating: service.rating, ratings: service.ratings });
    } catch (error) {
        console.error('Error fetching service rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


