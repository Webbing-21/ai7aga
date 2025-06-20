const express = require('express');
app = express();
const cors = require('cors');
require('dotenv').config();
const connecttodb = require('./config/ConnectDB');
connecttodb();
app.use(express.json());
app.use(cors({
    origin: '*',            
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use("/api/auth",require("./Routes/auth"));
app.use("/api/company",require("./Routes/campany"));
app.use("/api/order",require("./Routes/order"));
app.use("/api/code",require("./Routes/code"));
app.use("/api/booking",require("./Routes/booking"));
app.listen(process.env.PORT, () => {
    console.log(`Server is Running on Your Port`);
})