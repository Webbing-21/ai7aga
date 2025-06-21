const Wishlist = require('../Models/wishlistModel').Wishlist;
const { validateWishlist } = require('../Models/wishlistModel');
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, items, serviceitemId, serviceId } = req.body;
    const { error } = validateWishlist(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const newWishlist = new Wishlist({
      userId,
      items,
      serviceitemId,
      serviceId
    });

    await newWishlist.save();
    res.status(201).json({ message: 'Item added to wishlist successfully', wishlist: newWishlist });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ userId }).populate('items serviceitemId serviceId');
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    res.status(200).json(wishlist);
    }
    catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
}
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: itemId } },
      { new: true }
    ).populate('items serviceitemId serviceId');

    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    
    res.status(200).json({ message: 'Item removed from wishlist successfully', wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    ).populate('items serviceitemId serviceId');

    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    
    res.status(200).json({ message: 'Wishlist cleared successfully', wishlist });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.updateWishlistItem = async (req, res) => {
    try{
        const { userId, itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId, 'items._id': itemId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        ).populate('items serviceitemId serviceId');

        if (!wishlist) return res.status(404).json({ message: 'Wishlist or item not found' });

        res.status(200).json({ message: 'Wishlist item updated successfully', wishlist });
    }catch (error) {
        console.error('Error updating wishlist item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}