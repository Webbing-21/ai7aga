exports.addServiceItem = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { name, description, price, coverimage, serviceimage } = req.body;

        const { error } = validateServiceItem({
            name,
            description,
            price,
            coverimage,
            serviceimage
        });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const serviceItem = new serviceItemSchema({
            serviceId,
            name,
            description,
            price,
            coverimage,
            serviceimage
        });

        await serviceItem.save();
        res.status(201).json({ message: 'Service item added successfully', serviceItem });
    } catch (error) {
        console.error('Error adding service item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.getServiceItems = async (req, res) => {
    try {
        const { serviceId } = req.body;
        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required' });
        }

        const serviceItems = await serviceItemSchema.find({ serviceId }).populate('serviceId', 'name description');
        if (serviceItems.length === 0) {
            return res.status(404).json({ message: 'No service items found for this service' });
        }

        res.status(200).json(serviceItems);
    } catch (error) {
        console.error('Error fetching service items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.updateServiceItem = async (req, res) => {
    try {
        const { serviceItemId } = req.params;
        const updatedData = req.body;

        const { error } = validateServiceItem(updatedData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });

        const serviceItem = await serviceItemSchema.findByIdAndUpdate(serviceItemId, 
            { $set: { ...updatedData } }, { new: true });

        if (!serviceItem) {
            return res.status(404).json({ message: 'Service item not found' });
        }

        res.status(200).json({ message: 'Service item updated successfully', serviceItem });
    } catch (error) {
        console.error('Error updating service item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteServiceItem = async (req, res) => {
    try {
        const { serviceItemId } = req.body;
        if (!serviceItemId) {
            return res.status(400).json({ message: 'Service item ID is required' });
        }

        const serviceItem = await serviceItemSchema.findByIdAndDelete(serviceItemId);
        if (!serviceItem) {
            return res.status(404).json({ message: 'Service item not found' });
        }

        res.status(200).json({ message: 'Service item deleted successfully' });
    } catch (error) {
        console.error('Error deleting service item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}