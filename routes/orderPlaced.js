const express = require('express')
const router = express.Router();
const checkUth = require('../middileware/user-auth');
const { Address, OrderItem, Order} = require('../models/orderPlaced');
const moment = require('moment');
const MedicinesList = require('../models/medicinesList');

// Payment Rozor
const Razorpay = require('razorpay');

const razorpayID = new Razorpay({
  key_id: 'rzp_test_VA0XZjX8LqFRpj',
  key_secret: 'eWX1lEfZlLoEltR6U8EpcXLh',
});

router.post('/api/user/orderPlaced', checkUth, async (req, res) => {
  const chemistId = req.body.chemistId;
  const userId = req.body.userId;
  const orderItemDataArray = req.body.OrderItems;
  const totalPrice = req.body.totalPrice;
  const razorpay_payment_id = req.body.razorpay_payment_id || '';
  const razorpay_order_id = req.body.razorpay_order_id || '';
  const razorpay_signature = req.body.razorpay_signature || '';
  const payment_mode = req.body.paymentMode;
  const dateTime = new Date();
  const userAddress = new Address({
    DeliveryArea: req.body.address.DeliveryArea,
    address: req.body.address.address,
    name: req.body.address.name,
    phone: req.body.address.phone
  });

  // Map the array of OrderItem data to an array of OrderItem instances
  const orderItems = orderItemDataArray.map(orderItemData => new OrderItem(orderItemData));

  const newOrder = new Order({
    chemistId: chemistId,
    userId: userId,
    totalPrice: totalPrice,
    address: userAddress,
    OrderItems: orderItems,
    orderPlaceDate: dateTime,
    paymentPaymentId: razorpay_payment_id,
    paymentOrderId: razorpay_order_id,
    paymentSignature: razorpay_signature,
    paymentMode: payment_mode,
    orderStatus: 'Not Accept'
  });

  try {
    const data = await newOrder.save();
    const obj = {
      orderId: data._id,
      orderPlacedDate: data.orderPlaceDate
    };

    // Find the medicines list by chemist_id and _id
    const medicinesList = await MedicinesList.findOne({
      chemist_id: chemistId
    });

    if (!medicinesList) {
      return res.status(404).json({
        error: `Medicines list not found for Chemist ${chemistId}.`
      });
    }

    // Iterate through each medicine in the request body
    for (const { _id, quantity } of orderItemDataArray) {
      // Find the medicine by _id in the medicines_items array
      const medicineItemIndex = medicinesList.medicines_items.findIndex(item => item._id.toString() === _id);

      if (medicineItemIndex === -1) {
        return res.status(404).json({
          error: `Medicine with ID ${id} not found in the list`
        });
      }

      // Update quantity after purchase
      medicinesList.medicines_items[medicineItemIndex].stripQuantity -= quantity;
    }

    // Save the updated medicines list
    await medicinesList.save();

    res.status(200).json({
      status: 'success',
      message: 'data saved success',
      data: obj
    });

  } catch (error) {
    console.error('Error saving order:', error);
    res.status(200).json({
      status: 'fail',
      message: error.message  // use error.message to get the error message
    });
  }
});



router.post('/api/user/ordersOnline', checkUth, async (req, res) => {
  try {
    // const chemistId = req.body.chemistId;
    // const userId = req.body.userId;
    const totalPrice = req.body.totalPrice;
    const options = {
      amount: totalPrice * 100, // Razorpay expects amount in paisa
      currency: 'INR',
    };
    // await newOrder.save();
    try {
      const order = await razorpayID.orders.create(options);
      res.json({
        status: 'success',
        orderId: order.id,
        amount: order.amount
      });
    } catch (error) {
      console.error('Razorpay Order Creation Error:', error);
      res.status(500).json({
        error: 'Error creating Razorpay order'
      });
    }
    // res.status(200).json({
    //     status: 'success',
    //     message: 'data saved success',
    //     data: paymentUrl
    // });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(200).json({
      status: 'fail',
      message: error
    });
  }
});

router.post('/api/user/payment-callback', (req, res) => {
  // Handle Razorpay payment callback here
  res.json({
    status: 'success',
    razorpay_payment_id: req.body.razorpay_payment_id,
    razorpay_order_id: req.body.razorpay_order_id,
    razorpay_signature: req.body.razorpay_signature,
  });
});


// get order placed data in CHEMIST PORTAL || LIMIT DATA - 10
router.get('/api/chemist/getRecentPlacedOrderData/:id', checkUth, async (req, res) => {
  const chemist_Id = req.params.id;
  const data = await Order.find({
    chemistId: chemist_Id
  }).sort({
    orderPlaceDate: -1
  }).limit(10);
  if (!data.length) {
    return res.status(404).json({
      status: 'Fail',
      message: "No Data Found"
    });
  }
  const mappedData = data.map((data) => {
    return {
      orderId: data._id,
      customerName: data.address.name,
      orderPlaceDate: data.orderPlaceDate,
      orderStatus: data.orderStatus,
    }
  });
  return res.status(200).json({
    status: 'Success',
    data: mappedData
  });
});

// get order placed data in CHEMIST PORTAL || ALL DATA
router.get('/api/chemist/getAllPlacedOrderData/:id', checkUth, async (req, res) => {
  const chemist_Id = req.params.id;
  const data = await Order.find({
    chemistId: chemist_Id
  }).sort({
    orderPlaceDate: -1
  });
  if (!data) {
    return res.status(200).json({
      status: 'Fail',
      message: "No Data Found",
      data: []
    });
  }
  const mappedData = data.map((data) => {
    return {
      orderId: data._id,
      customerName: data.address.name,
      placedDate: data.orderPlaceDate,
      orderStatus: data.orderStatus,
    }
  });
  return res.status(200).json({
    status: 'Success',
    message: "Data fetch success",
    data: {
      columnHeaders: [{
          "columnId": 1,
          "columnName": "Order Id",
          "columnCode": "orderId",
          "columnType": "String"
        },
        {
          "columnId": 2,
          "columnName": "Customer Name",
          "columnCode": "customerName",
          "columnType": "String"
        },
        {
          "columnId": 3,
          "columnName": "Placed Date",
          "columnCode": "placedDate",
          "columnType": "String"
        },
        {
          "columnId": 4,
          "columnName": "Order Status",
          "columnCode": "orderStatus",
          "columnType": "String"
        },
        {
          "columnId": 5,
          "columnName": "Action",
          "columnCode": "action",
          "columnType": "String"
        },

      ],
      "tableData": mappedData
    }
  });
});

// get order placed data in CHEMIST PORTAL || ALL DATA
router.get('/api/chemist/getOnePlacedOrderData/:id', checkUth, async (req, res) => {
  const order_id = req.params.id;
  const data = await Order.find({
    _id: order_id
  });
  if (!data) {
    return res.status(200).json({
      status: 'Fail',
      message: "No Data Found",
      data: []
    });
  }
  return res.status(200).json({
    status: 'Success',
    message: "Data fetch success",
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
          "columnName": "Quantity",
          "columnCode": "quantity",
          "columnType": "String"
        }
      ],
      "data": data
    }
  });
});


// Updated user order placed status from CHEMIST

router.post('/api/chemist/getOnePlacedOrderStatusUpdateForAccept/:chemistId', checkUth, async (req, res) => {
  const {
    orderId,
    orderStatus,
    medicinesListToBeUpdated
  } = req.body;
  const chemistId = req.params.chemistId;
  const data = await Order.findOneAndUpdate({
    _id: orderId
  }, {
    $set: {
      orderStatus
    }
  });

  if (!data) {
    return res.status(200).json({
      status: 'Fail',
      message: "No Data Found"
    });
  }

  return res.status(200).json({
    status: 'Success',
    message: "Order status updated successfully."
  });
});

router.post('/api/chemist/getOnePlacedOrderStatusUpdateForReject/:chemistId', checkUth, async (req, res) => {
  const {
    orderId,
    orderStatus,
    medicinesListToBeUpdated
  } = req.body;
  const chemist_id = req.params.chemistId;
  try {
    const data = await Order.findOneAndUpdate({
      _id: orderId,
      chemistId: chemist_id
    }, {
      $set: {
        orderStatus
      }
    });

    if (!data) {
      return res.status(200).json({
        status: 'Fail',
        message: "No Order Data Found"
      });
    }

    // Find the medicines list by chemist_id
    const medicinesList = await MedicinesList.findOne({chemist_id});
    if (!medicinesList) {
      return res.status(404).json({
        error: `Medicines list not found for Chemist ${chemist_id}.`
      });
    }
    // Iterate through each medicine in the request body
    for (const { _id, quantity } of medicinesListToBeUpdated.OrderItems) {
      // Find the medicine by _id in the medicines_items array
      const medicineItemIndex = medicinesList.medicines_items.findIndex(item => item._id.toString() === _id);

      if (medicineItemIndex === -1) {
        return res.status(404).json({
          error: `Medicine with ID ${_id} not found in the list`
        });
      }

      // Update quantity after order rejection
      medicinesList.medicines_items[medicineItemIndex].stripQuantity += quantity;
    }

    // Save the updated medicines list
    await medicinesList.save();

    return res.status(200).json({
      status: 'Success',
      message: "Order status updated successfully."
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      status: 'Error',
      message: "Internal Server Error"
    });
  }
});






module.exports = router;