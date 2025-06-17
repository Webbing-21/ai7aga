const mongoose = require('mongoose');
const connecttodb= async () => {
    try {
        mongoose.set('strictQuery', false); 
            mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}  
module.exports = connecttodb;