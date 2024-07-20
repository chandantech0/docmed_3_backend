const mongoose = require('mongoose');

const medicinesListSchema = mongoose.Schema({
    chemist_id: {type: mongoose.Schema.Types.ObjectId, ref: 'medicalList'},
    medicines_items:[{
        name: String,
        manufacturer: String,
        selected: Boolean,
        quantity: Number,
        price: Number,
        prescribeRequired: String,
        stock: String,
        stripQty: Number,
        perStripTabletQty: Number,
        stripQuantity: Number,
        
    }]
});

// medicinelists - collection name (DB)
module.exports = mongoose.model('medicinelists', medicinesListSchema);