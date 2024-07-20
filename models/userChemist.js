const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: {type: String, require: true, unique: true},
    name: {type: String, require: true},
    chemistName: {type: String, require: true},
    password: {type: String, require: true},
    address: {type: String, require: true},
    licenseNumber: {type: String, require: true},
    registrationDate: {type: String, require: true},
    phone: {type: Number, require: true},
    pinCode: {type: Number, require: true},
    city: {type: String, require: true},
    area: {type: String, require: true},
    userType: {type: String, require: true},
    userTypeSub: {type: String},
    otp: {type: String},
    isVerified: {type: Boolean, require: true},
    isActive: {type: Boolean, require: true},
    isBlock: {type: Boolean, require: true},
    image: { type: String }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('ChemistSignUp', userSchema);