const Search= require('../Models/searchModel');
exports.storeSearch = async (req, res) => {
  try {
    const { searchTerm, results, modelType } = req.body;
    const userId = req.user._id;

    const newSearch = new Search({
      userId,
      searchTerm,
      results,
      modelType
    });

    await newSearch.save();
    res.status(201).json({ message: 'Search saved' });
 } catch (error) {
    res.status(500).json({ message: 'Error saving search', error });
  }
};
exports.getSearchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const searches = await Search.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(searches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search history', error });
  }
}
exports.deleteSearch = async (req, res) => {
  try {
    const searchId = req.params.id;
    const userId = req.user._id;

    const search = await Search.findOneAndDelete({ _id: searchId, userId });
    if (!search) {
      return res.status(404).json({ message: 'Search not found' });
    }
    res.status(200).json({ message: 'Search deleted successfully' });
    } catch (error) {
    res.status(500).json({ message: 'Error deleting search', error });
    }
}
exports.clearSearchHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        await Search.deleteMany({ userId });
        res.status(200).json({ message: 'Search history cleared successfully' });
        } catch (error) {
    res.status(500).json({ message: 'Error clearing search history', error });
    }
}
