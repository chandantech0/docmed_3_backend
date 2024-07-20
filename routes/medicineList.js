const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const MedicinesList = require('../models/medicinesList');
const medicalList = require('../models/medicalLists');
const checkUth = require('../middileware/user-auth');
// checkUth
router.get('/api/user/getMedicinesLists/:id/:chemistId', async (req, res, next) => {
  try {
    const data = await MedicinesList.find({ chemist_id: req.params.id });
    const chemistData = await medicalList.findById({ _id: req.params.chemistId });

    if (!chemistData) {
     return res.status(404).json({
        status: "Fail",
        message: 'Data Not Found'
      });
    }

    if (data.length !== 0) {
      res.status(200).json({
        status: "success",
        message: 'data fetch success',
        data: data,
        chemistData: chemistData
      });
    } else {
      res.status(200).json({
        status: "success",
        message: 'data fetch success',
        data: [{ "medicines_items": [] }],
        chemistData: chemistData
      });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      status: "error",
      message: 'Internal Server Error'
    });
  }
});

// checking for order history to checkout 
router.post('/api/user/getMedicinesListsByChemistId', async (req, res, next) => {
  try {
    const data = await MedicinesList.find({ chemist_id: req.body.chemistId });
    if (data.length !== 0) {
      res.status(200).json({
        status: "Success",
        message: 'data fetch success',
        data: data,
      });
    } else {
      res.status(200).json({
        status: "Fail",
        message: 'data fetch success',
        data: [{ "medicines_items": [] }],
      });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      status: "error",
      message: 'Internal Server Error'
    });
  }
});



// Search Medicine by USER
router.post('/api/user/getMedicinesListsBySearch', async (req, res, next) => {
  try {
    const searchKey = req.body.searchKey || '';
    const regex = new RegExp(searchKey, 'i'); // i is here for case insensitive 

    const medicineData = await MedicinesList.aggregate([
      {
        $match: {
          chemist_id: new mongoose.Types.ObjectId(req.body.chemist_id),
        }
      },
      {
        $project: {
          medicines_items: {
            $filter: {
              input: '$medicines_items',
              as: 'item',
              cond: {
                $regexMatch: {
                  input: '$$item.name',
                  regex: regex
                }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: "success",
      message: 'Data fetch success',
      medicinesLists: medicineData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: 'Internal server error',
    });
  }
});


// ADD DATA BY CHEMIST
// POST endpoint to save medicine data
router.post('/api/chemist/addMedicine', checkUth, async (req, res) => {
  try {
    const {
      chemistId,
      medicineData
    } = req.body;
    // Fetch the chemist by ID
    const chemistMedicineStore = await MedicinesList.findOne({
      chemist_id: chemistId
    });

    if (!chemistMedicineStore) {
      return res.status(404).json({
        message: 'Store not found.'
      });
    }

    // Check if the medicines_items array exists, if not, create it
    if (!chemistMedicineStore.medicines_items) {
      chemistMedicineStore.medicines_items = [];
    }

    // Check if the medicine with the given data already exists
    const existingMedicine = chemistMedicineStore.medicines_items.find(
      (medicine) => medicine.name === medicineData.name
    );

    if (existingMedicine) {
      return res.status(400).json({
        message: 'Duplicate medicine entry not allowed.'
      });
    }

    // Add the medicine to the medicines_items array
    chemistMedicineStore.medicines_items.push({
      name: medicineData.name,
      manufacturer: medicineData.manufacturer,
      stripQuantity: medicineData.stripQuantity,
      stock: medicineData.stock,
      price: medicineData.price,
      prescribeRequired: medicineData.isPrescribeRequired,
      perStripTabletQty: medicineData.perStripTabletQty,
      selected: false,
      quantity: 1
    });

    // Save the updated chemist data
    await chemistMedicineStore.save();

    res.status(200).json({
      status: "Success",
      message: 'Medicine data saved successfully.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error
    });
  }
});

router.get('/api/chemist/getChemistAllMedicines/:id', checkUth, (req, res, next) => {
  MedicinesList.find({
    chemist_id: req.params.id
  }).then((data) => {
    if (data.length !== 0) {
      res.status(200).json({
        status: "success",
        message: 'data fetch success',
        data: {
          columnHeaders: [{
              "columnId": 1,
              "columnName": "Name",
              "columnCode": "name",
              "columnType": "String"
            },
            {
              "columnId": 2,
              "columnName": "Manufacturer",
              "columnCode": "manufacturer",
              "columnType": "String"
            },
            {
              "columnId": 3,
              "columnName": "Strip Quantity",
              "columnCode": "stripQty",
              "columnType": "String"
            },
            {
              "columnId": 4,
              "columnName": "Per Strip Tablet Quantity",
              "columnCode": "perStripTabletQty",
              "columnType": "String"
            },
            {
              "columnId": 4,
              "columnName": "Stock",
              "columnCode": "stock",
              "columnType": "String"
            },
            {
              "columnId": 5,
              "columnName": "Prescribe Required",
              "columnCode": "prescribeRequired",
              "columnType": "String"
            },
            {
              "columnId": 6,
              "columnName": "Price",
              "columnCode": "price",
              "columnType": "String"
            },
            {
              "columnId": 7,
              "columnName": "Edit",
              "columnCode": "edit",
              "columnType": "String"
            },
            {
              "columnId": 8,
              "columnName": "Delete",
              "columnCode": "delete",
              "columnType": "String"
            }
          ],
          "tableData": data[0].medicines_items
        }
      });
    } else {
      res.status(200).json({
        status: "success",
        message: 'data fetch success',
        data: {
          columnHeaders: [{
              "columnId": 1,
              "columnName": "Name",
              "columnCode": "name",
              "columnType": "String"
            },
            {
              "columnId": 2,
              "columnName": "Manufacturer",
              "columnCode": "manufacturer",
              "columnType": "String"
            },
            {
              "columnId": 3,
              "columnName": "Strip Quantity",
              "columnCode": "stripQty",
              "columnType": "String"
            },
            {
              "columnId": 4,
              "columnName": "Per Strip Tablet Quantity",
              "columnCode": "perStripTabletQty",
              "columnType": "String"
            },
            {
              "columnId": 4,
              "columnName": "Stock",
              "columnCode": "stock",
              "columnType": "String"
            },
            {
              "columnId": 5,
              "columnName": "Prescribe Required",
              "columnCode": "prescribeRequired",
              "columnType": "String"
            },
            {
              "columnId": 6,
              "columnName": "Price",
              "columnCode": "price",
              "columnType": "String"
            },
            {
              "columnId": 7,
              "columnName": "Edit",
              "columnCode": "edit",
              "columnType": "String"
            },
            {
              "columnId": 8,
              "columnName": "Delete",
              "columnCode": "delete",
              "columnType": "String"
            }
          ],
          "tableData": []
        }
      });
    }
  });

});


// UPDATE DATA BY CHEMIST
// POST endpoint to save medicine data
router.post('/api/chemist/updateMedicine', checkUth, async (req, res) => {
    const {
      chemistId,
      medicineData
    } = req.body;
 // Update the medicine in the array
MedicinesList.findOneAndUpdate(
  { chemist_id: chemistId, 'medicines_items.name': medicineData.name },
  {
      $set: {
          'medicines_items.$.name': medicineData.quantity,
          'medicines_items.$.manufacturer': medicineData.manufacturer,
          'medicines_items.$.stripQuantity': medicineData.stripQuantity,
          'medicines_items.$.stock': medicineData.stock,
          'medicines_items.$.prescribeRequired': medicineData.prescribeRequired,
          'medicines_items.$.quantity': medicineData.quantity,
          'medicines_items.$.price': medicineData.price,
          'medicines_items.$.prescribeRequired': medicineData.isPrescribeRequired,
      },
  },
  { new: true }
)
  .then(updatedDocument => {
      if (updatedDocument) {
        res.status(200).json({
          status: "Success",
          message: 'Medicine data saved successfully.'
        });
      } else {
        res.status(500).json({
          status: "Fail",
          message: 'Medicine data not saved.'
        });
      }
  })
  .catch(error => {
    res.status(500).json({
      status: "Fail",
      message: error
    });
  });
});


// DELETE MEDICINE DATA BY CHEMIST
router.post('/api/chemist/deleteMedicine', checkUth, async (req, res) => {
  try {
    const {
      chemistId,
      medicineId
    } = req.body;
    // Fetch the chemist by ID
    const chemistMedicineStore = await MedicinesList.findOne({
      chemist_id: chemistId
    });

    if (!chemistMedicineStore) {
      return res.status(404).json({
        status: "Fail",
        message: 'MedicinesList not found for the given chemist ID.'
      });
    }

    const medicineIdIndex = chemistMedicineStore.medicines_items.findIndex(medicine => medicine._id.toString() === medicineId);

    if (medicineIdIndex === -1) {
      // Handle the case where the medicine is not found
      return res.status(404).json({
        status: "Fail",
        message: 'Medicine not found for the given ID.'
      });
    }

    // Remove the medicine from the array
    chemistMedicineStore.medicines_items.splice(medicineIdIndex, 1);
    await chemistMedicineStore.save();
    
    res.status(200).json({
      status: "Success",
      message: 'Medicine deleted successfully.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Fail",
      message: 'Error deleting medicine.', error: error.message
    });
  }
});


module.exports = router;