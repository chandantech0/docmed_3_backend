const express = require('express');
const router = express.Router();
const checkUth = require('../middileware/user-auth');
const multer = require('multer');
const ChemistSignUp = require('../models/userChemist');
const medicalList = require('../models/medicalLists');

//  Image Upload Configuration multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/chemist-images/');
    },
    filename: (req, file, cb) => {
        let ext = file.originalname.toLocaleLowerCase().split(" ").join("-");
        cb(null, Date.now() + '-' + ext)
    }
});

router.post('/api/chemist/getProfile', checkUth, async (req, res, next) => {
    const {
        chemistId
    } = req.body;
    console.log(chemistId)
    try {
        const chemUser = await ChemistSignUp.find({
            _id: chemistId
        });
        if (chemUser) {
            const userData = {
                chemist_name: chemUser[0].chemistName,
                phone: chemUser[0].phone,
                chemist_profile_image: chemUser[0].image
            }

            res.status(200).json({
                status: 'Success',
                message: 'Information fetch successfully',
                data: userData
            });
        } else {
            res.status(404).json({
                status: 'Fail',
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'Fail',
            message: error.error,
            error
        });
    }
});

router.post('/api/chemist/updateProfile', multer({
    storage: storage
}).single("image"), checkUth, async (req, res, next) => {
    const {
        // chemistName,
        phoneNumber,
        chemistId
    } = req.body;
    const url = req.protocol + '://' + req.get("host");
    try {
        const chemUser = await ChemistSignUp.findOneAndUpdate({
            _id: chemistId
        }, {
            $set: {
                // chemistName: chemistName,
                phone: phoneNumber,
                // email: userEmailId,
                image: url + "/chemist-images/" + req.file.filename
            }
        }, {
            new: true
        });
        if (chemUser) {
            const medical_list = await medicalList.findOneAndUpdate({
                chemistSignUpId: chemistId
            }, {
                $set: {
                    image: url + "/chemist-images/" + req.file.filename
                }
            });

            if (medical_list) {
                res.status(200).json({
                    status: 'Success',
                    message: 'Information updated successfully',
                });
            } else {
                res.status(404).json({
                    status: 'Fail',
                    message: 'Medical not found'
                });
            }
        } else {
            res.status(404).json({
                status: 'Fail',
                message: 'User not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'Fail',
            message: 'Error updating user information',
            error
        });
    }
});

module.exports = router;