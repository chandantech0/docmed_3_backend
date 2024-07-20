const mongoose = require('mongoose');

const userOrderHistory = mongoose.Schema({
    userId: String, 
    orderPlaceDate: String, 
    OrderItems: Array, 
    totalPrice: Number,
    orderStatus: String,
    chemistId: String
});

module.exports = mongoose.model('orders', userOrderHistory);