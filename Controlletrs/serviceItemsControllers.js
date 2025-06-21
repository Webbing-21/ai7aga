const ServiceItem = require('../models/serviceItemModel');
const { validateServiceItem } = require('../models/serviceItemModel');
const Service = require('../Models/serviceModel');
exports.addServiceItem = async (req, res) => {
  try {
    const { role, companyId: adminCompanyId } = req.user;
    const { serviceId } = req.params;
    const { name, description, price } = req.body;

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (role === 'admin' && service.companyId.toString() !== adminCompanyId.toString()) {
      return res.status(403).json({ message: 'You do not have permission to add service items for this service' });
    }

    const { error } = validateServiceItem({ name, description, price });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const serviceItem = new ServiceItem({
      serviceId,
      name,
      description,
      price,
      coverimage: {
        data: req.files['coverimage'][0].buffer,
        contentType: req.files['coverimage'][0].mimetype
      },
      serviceimage: req.files['serviceimage'].map(file => ({
        data: file.buffer,
        contentType: file.mimetype
      }))
    });

    await serviceItem.save();
    res.status(201).json({ message: 'Service item added successfully', serviceItem });
  } catch (error) {
    console.error('Error adding service item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updateServiceItem = async (req, res) => {
  try {
    const { role, companyId: adminCompanyId } = req.user;
    const { serviceItemId } = req.params;
    const updatedData = req.body;

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const serviceItem = await ServiceItem.findById(serviceItemId).populate('serviceId');
    if (!serviceItem) return res.status(404).json({ message: 'Service item not found' });

    if (role === 'admin' && serviceItem.serviceId.companyId.toString() !== adminCompanyId.toString()) {
      return res.status(403).json({ message: 'You do not have permission to update this service item' });
    }

    const { error } = validateServiceItem(updatedData);
    if (error) return res.status(400).json({ message: error.details[0].message });

    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === undefined) delete updatedData[key];
    });

    const updated = await ServiceItem.findByIdAndUpdate(
      serviceItemId,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).json({ message: 'Service item updated successfully', serviceItem: updated });
  } catch (error) {
    console.error('Error updating service item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.deleteServiceItem = async (req, res) => {
  try {
    const { role, companyId: adminCompanyId } = req.user;
    const { serviceItemId } = req.body;

    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const serviceItem = await ServiceItem.findById(serviceItemId).populate('serviceId');
    if (!serviceItem) return res.status(404).json({ message: 'Service item not found' });

    if (role === 'admin' && serviceItem.serviceId.companyId.toString() !== adminCompanyId.toString()) {
      return res.status(403).json({ message: 'You do not have permission to delete this service item' });
    }

    await ServiceItem.findByIdAndDelete(serviceItemId);
    res.status(200).json({ message: 'Service item deleted successfully' });
  } catch (error) {
    console.error('Error deleting service item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
