const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// added a framework of mongoDB.
const mongoose = require('mongoose');
const path = require('path');
// routes import of API
const medicalListRoute = require('./routes/medicalList');
const userRoutes = require('./routes/user');
const medicinesListRoute = require('./routes/medicineList');
const orderPlaced = require('./routes/orderPlaced');
const orderHistory = require('./routes/userOrderHistory');
const chemistProfile = require('./routes/chemist-profile');

// added cors for strict origin issue
app.use(cors());

// added for data transfer as json format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/chemist-images', express.static(path.join("backend/chemist-images")));

// Z6DbuQnhmjnfMxZk  (atlas password)

// database connection 
mongoose.connect('mongodb+srv://chandantech0:Z6DbuQnhmjnfMxZk@cluster1.lcmmysp.mongodb.net/')

.then(() => {
    console.log('DB Connect');
}).catch((err) => {
    console.log('DB Failed' + err)
});

// medical list routes from grouping
app.use(userRoutes);
app.use(medicalListRoute);
app.use(medicinesListRoute);
app.use(orderPlaced);
app.use(orderHistory);
app.use(chemistProfile);

module.exports = app;