const Search= require('../Models/searchModel');
const User = require('../Models/userModel');
const ServiceItem = require('../models/serviceItemModel');

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
exports.updateProfile = async (req, res) => {
    try {
        const updatedData = req.body;
        const userId = req.user.id; 
        Object.keys( updatedData ).forEach(
            (key) =>  updatedData [key] === undefined && delete  updatedData [key]
        );
        if (!updatedData==='name'|| !updatedData==='email'|| !updatedData==='phone') {
            return res.status(400).json({ message: "it's not allowed to be updated here" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$set:{...updatedData}},
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).
            json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", updatedUser:{name:updatedUser.name,email:updatedUser.email,phone:updatedUser.phone} });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('name email phone');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  }
  exports.deleteAccount = async (req, res) => {
    try {
      const {companyId} = req.params;
      if(!companyId) {
        const userId = req.user.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Account deleted successfully' });
      } else {
        const name = req.body;
        const user = await User.findOneAndDelete({  name: { $regex: new RegExp(name, 'i') }, companyId });
        if (!user) {
            return res.status(404).json({ message: 'User not found in this company' });
        }
        res.status(200).json({ message: 'Account deleted successfully from company' });
      }
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  }
exports.findUserInCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { username } = req.body;

    if (!companyId || !username) {
      return res.status(400).json({ message: 'companyId and username are required' });
    }

    const user = await User.findOne({
      companyId,
      name: { $regex: new RegExp(username, 'i') } 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in this company' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// exports.deleteUserInCompany = async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const { username } = req.body;

//     if (!companyId || !username) {
//       return res.status(400).json({ message: 'companyId and username are required' });
//     }

//     const user = await User.findOne({
//       companyId,
//       name: { $regex: new RegExp(username, 'i') }
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found in this company' });
//     }
//     const deletedUser = await User.findByIdAndDelete(user._id);
//     res.status(200).json("user deleted successfully");
//   } catch (error) {
//     console.error('Error finding user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.getRecentServiceItems = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    // Find recent searches related to ServiceItem
    const recentSearches = await Search.find({
      userId,
      modelType: 'ServiceItem'
    })
    .sort({ createdAt: -1 }) // Most recent first
    .limit(5); // Limit the number of searches (optional)

    // Extract all result IDs (flatten array)
    const serviceItemIds = recentSearches.flatMap(search => search.results);

    // Remove duplicates (optional)
    const uniqueItemIds = [...new Set(serviceItemIds.map(id => id.toString()))];

    // Fetch the actual ServiceItem documents
    const serviceItems = await ServiceItem.find({
      _id: { $in: uniqueItemIds }
    });

    res.status(200).json({ serviceItems });

  } catch (error) {
    console.error('Error fetching recent ServiceItems:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
