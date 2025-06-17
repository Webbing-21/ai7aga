const express = require('express');
app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
require('dotenv').config();
const connecttodb= async () => {
    try {
        mongoose.set('strictQuery', false); 
            mongoose.connect(process.env.URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connecttodb();
app.listen(process.env.PORT, () => {
    console.log(`Server is Running on Your Port`);
})
app.use(cors({
  origin: '*',            
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));