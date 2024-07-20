const express = require('express');
const router = express.Router();
const userOrderHistory = require('../models/userOrderHistory');
const checkUth = require('../middileware/user-auth');

router.get('/api/user/getAllUserOrderHistory/:id', checkUth, (req, res, next) => {
    userOrderHistory.find({userId: req.params.id}).then((data) => {
        try {
               const modifyData = data.map((obj) => {
                    return {
                    id: obj._id,
                    date: obj.orderPlaceDate,
                    total: obj.totalPrice,
                    OrderItems: obj.OrderItems,
                    orderStatus: obj.orderStatus,
                    chemistId: obj.chemistId
                    }
                  });
            
            // Reverse the array to maintain the original order (descending order based on date)
            const modifiedDataDescendingOrder = modifyData.reverse();

            res.status(200).json({
                status: "success",
                message: 'data fetch success',
                data: modifiedDataDescendingOrder,
            });
        }
         catch (err) {
            res.status(200).json({
                status: "fail",
                message: err,
                data: []
            });
        }
    });
});

module.exports = router;