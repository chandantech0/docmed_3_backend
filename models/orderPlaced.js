const mongoose = require('mongoose');

// Address schema
const addressSchema = new mongoose.Schema({
  DeliveryArea: String,
  address: String,
  name: String,
  phone: Number,
});

// OrderItem schema
const orderItemSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  manufacturer: String,
  selected: Boolean,
  quantity: Number,
  price: Number,
  chemist_id: String,
});

// Main schema
const orderSchema = new mongoose.Schema({
  chemistId: String,
  userId: String,
  totalPrice: Number,
  orderPlaceDate: String,
  orderStatus: String,
  paymentMode: String,
  paymentOrderId: String,
  paymentPaymentId: String,
  paymentSignature: String,
  address: addressSchema,
  OrderItems: [orderItemSchema],
});

// Create models based on the schemas
const Address = mongoose.model('Address', addressSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Address, OrderItem, Order };
