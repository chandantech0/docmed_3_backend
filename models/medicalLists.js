const mongoose = require('mongoose');

const medicalListSchema = mongoose.Schema({
    chemistSignUpId: String,
    title: String,
    address: String,
    deliveryTime: String,
    image: String,
    city: String,
    area: String,
    isActive: Boolean,
    isBlock: Boolean,
});
// medicalList - collection name ==> should be smaller all letter
module.exports = mongoose.model('medicalList', medicalListSchema);