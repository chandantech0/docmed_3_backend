const express = require('express');
const route = express.Router();
const bCrypt = require('bcryptjs');
const User = require('../models/user');
const ChemistSignUp = require('../models/userChemist');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const MedicalList = require('../models/medicalLists');
const checkUth = require('../middileware/user-auth');
const MedicinesList = require('../models/medicinesList');
const { generateRandomSecret } = require('../util/secure-secret-generator');
const { setSecureKey, GetSecureKey } = require('../util/config');

// for SMS Uninstall cmd - npm uninstall twilio dotenv
// const twilio = require('twilio');
// const dotenv = require('dotenv');

// OTP verified
// route.post('/api/user/signup-otp', async (req, res, next) => {
//     // Twilio configuration
//     const TWILIO_ACCOUNT_SID = 'AC30450ef5e945ddb58d86aabe39169d3f';
//     const TWILIO_AUTH_TOKEN = 'c5022bb7b4b44c34d78f17f3e945d127';
//     const TWILIO_PHONE_NUMBER = '7238818693';
//     const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

//     console.log(req.body)
//     const { phone } = req.body;
//     // Generate a random 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     try {
//       // Save the OTP to the user in the database
//       const user = await User.findOneAndUpdate({ phone }, { otp }, { new: true, upsert: true });

//       // Send the OTP via SMS using Twilio
//       await twilioClient.messages.create({
//         to: `+91${phone}`,
//         from: `+91${TWILIO_PHONE_NUMBER}`,
//         body: `Your OTP is: ${otp}`,
//       });

//       res.status(200).json({ message: 'OTP sent successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error sending OTP' });
//     }
// });

// OTP verified Via Email
route.post('/api/user/signup-otp-email', async (req, res, next) => {
    const {
        email
    } = req.body;
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.findOneAndUpdate({
        email
    }, {
        otp
    }, {
        new: true,
        upsert: true
    });
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // If using Gmail, or use your SMTP details
        auth: {
            user: 'cgrockboy@gmail.com', // Your email address
            pass: 'itgckbcrhlvronhm', // Your email password or app-specific password
        },
    });

    // Email options
    const mailOptions = {
        from: 'cgrockboy@gmail.com',
        to: email,
        subject: 'DocMed - Sign Up OTP',
        text: `Hello, this is your OTP ${otp} !`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).json({
                status: 'Fail',
                message: 'Error sending OTP'
            });
        } else {
            res.status(200).json({
                status: 'Success',
                message: 'OTP sent successfully'
            });
        }
    });
});

route.post('/api/chemist/signup-otp-email', async (req, res, next) => {
    const {
        email
    } = req.body;
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await ChemistSignUp.findOneAndUpdate({
        email
    }, {
        otp
    }, {
        new: true,
        upsert: true
    });
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // If using Gmail, or use your SMTP details
        auth: {
            user: 'cgrockboy@gmail.com', // Your email address
            pass: 'itgckbcrhlvronhm', // Your email password or app-specific password
        },
    });

    // Email options
    const mailOptions = {
        from: 'cgrockboy@gmail.com',
        to: email,
        subject: 'DocMed - Sign Up OTP',
        text: `Hello, this is your OTP ${otp} !`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).json({
                status: 'Fail',
                message: 'Error sending OTP'
            });
        } else {
            res.status(200).json({
                status: 'Success',
                message: 'OTP sent successfully'
            });
        }
    });
});

// sign up with hashKey
route.post('/api/user/signup', (req, res, next) => {
    bCrypt.hash(req.body.password, 10).then((encPassword) => {
        const user = new User({
            email: req.body.email,
            password: encPassword,
            phone: req.body.phone,
            userType: req.body.userType,
            userTypeSub: req.body.userTypeSub,
            isVerified: false,
            otp: '',
        });
        user.save().then((result) => {
                res.status(200).json({
                    status: 'Success',
                    message: 'User created Successful.',
                    data: result
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'fail',
                    message: err.message,
                });
            });
    })
});

// sign up with hashKey CHEMIST
route.post('/api/chemist/signup', (req, res, next) => {
    bCrypt.hash(req.body.password, 10).then((encPassword) => {
        const chemistUser = new ChemistSignUp({
            email: req.body.email,
            name: req.body.name,
            chemistName: req.body.chemistName,
            password: encPassword,
            phone: req.body.phone,
            address: req.body.Address,
            licenseNumber: req.body.LicenseNumber,
            registrationDate: req.body.RegistrationDate,
            userType: req.body.userType,
            userTypeSub: req.body.userTypeSub,
            pinCode: req.body.pinCode,
            city: req.body.city,
            area: req.body.area,
            isVerified: false,
            isActive: false,
            isBlock: false,
            otp: '',
        });
        chemistUser.save().then((result) => {
                res.status(200).json({
                    status: 'Success',
                    message: 'chemist User created Successful.',
                    data: result
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'fail',
                    message: err.message,
                });
            });
    })
});

// OTP Submit and verified data true
route.post('/api/user/signUpOtpSubmit', async (req, res, next) => {
    const {
        email,
        enteredOtp
    } = req.body;
    try {
        const user = await User.findOneAndUpdate({
            email,
            otp: enteredOtp
        }, {
            $set: {
                isVerified: true
            }
        }, {
            new: true
        });
        if (user) {
            res.status(200).json({
                status: 'Success',
                message: 'User created Successful.',
                data: user
            });
        } else {
            res.status(200).json({
                status: 'fail',
                message: 'Otp Incorrect',
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
});

// OTP Submit and verified data true For CHEMIST
route.post('/api/chemist/signUpOtpSubmit', async (req, res, next) => {
    const {
        email,
        enteredOtp
    } = req.body;
    try {
        const chemistUser = await ChemistSignUp.findOneAndUpdate({
            email,
            otp: enteredOtp
        }, {
            $set: {
                isVerified: true
            }
        }, {
            new: true
        });
        if (chemistUser) {
            const MedicalListData = new MedicalList({
                chemistSignUpId: chemistUser._id,
                title: chemistUser.chemistName,
                address: chemistUser.address,
                city: chemistUser.city,
                area: chemistUser.area,
                isActive: false,
                isBlock: false
            })
            const newMedicalList = await MedicalListData.save();
            console.log(newMedicalList);
            const MedicinesListData = new MedicinesList({
                chemist_id: chemistUser._id
            })
            const chemistMedicinesStore = await MedicinesListData.save();
            console.log(chemistMedicinesStore);
            res.status(200).json({
                status: 'Success',
                message: 'chemist User created Successful.',
                data: chemistUser
            });
        } else {
            res.status(200).json({
                status: 'fail',
                message: 'Otp Incorrect',
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
});

// isActive toggle function || CHEMIST
route.post('/api/chemist/updateActiveStatusOfShop', checkUth, async (req, res, next) => {
    const {
        chemistId,
        isActiveStatus
    } = req.body;
    try {
        const chemistUser = await ChemistSignUp.findOneAndUpdate({
            _id: chemistId
        }, {
            $set: {
                isActive: isActiveStatus
            }
        }, {
            new: true
        });
        if (chemistUser) {
            const medicalUpdate = await MedicalList.findOneAndUpdate({
                chemistSignUpId: chemistId
            }, {
                $set: {
                    isActive: isActiveStatus
                }
            }, {
                new: true
            });
            console.log(medicalUpdate)
            res.status(200).json({
                status: 'Success',
                message: 'Status Updated',
                data: chemistUser
            });
        } else {
            res.status(200).json({
                status: 'Fail',
                message: 'Something went wrong',
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});

// Onload check isActive status || CHEMIST
route.get('/api/chemist/getStatusOfShop/:id', checkUth, async (req, res, next) => {
    try {
        const chemistUser = await ChemistSignUp.find({
            _id: req.params.id
        });
        if (chemistUser.length) {
            res.status(200).json({
                status: 'Success',
                message: 'Chemist Data Fetch',
                data: chemistUser
            });
        } else {
            res.status(440).json({
                status: 'Fail',
                message: 'Something went wrong',
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});


// Login
route.post('/api/user/login', async (req, res) => {
    try {
        let user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            user = await ChemistSignUp.findOne({
                email: req.body.email
            });
        }
        if (!user) {
            return res.status(401).json({
                status: 'Fail',
                message: 'Auth Failed'
            });
        }
        if (user.isVerified === false) {
            return res.status(200).json({
                status: 'Fail',
                isVerified: user.isVerified.toString(),
                userType: user.userType,
                message: 'Email Not Verified!. Please Verified your email.'
            });
        }
        const result = await bCrypt.compare(req.body.password, user.password);
        if (!result) {
            return res.status(401).json({
                status: 'Fail',
                message: 'Auth Failed ! Your Password is Incorrect.'
            });
        }
        // Generate or retrieve the secret key
        const robustSecretKey = generateRandomSecret();
        setSecureKey(robustSecretKey);
       // Use the generated secret to sign the JWT
            const token = jwt.sign({
            email: user.email,
            userId: user._id
            }, robustSecretKey, {
            expiresIn: '1d'
            });
        res.status(200).json({
            status: 'success',
            message: 'Login Success',
            token: token,
            userId: user._id,
            userType: user.userType,
            name: user.name,
            userTypeSub: user.userTypeSub
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});


// check jwt valid for relogin

route.get('/api/user/isLoginExist', (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const secKey = GetSecureKey();
        jwt.verify(token, secKey, (err, user) => {
            if (err) {
                res.status(200).json({
                    status: 'Fail',
                    message: 'Login Fail',
                });
            }
            User.findOne({
                email: user.email
            }).then((generalUser) => {
                if (!generalUser) {
                    ChemistSignUp.findOne({
                        email: user.email
                    }).then((chemistUser) => {
                        if (!chemistUser) {
                            res.status(401).json({
                                status: 'Fail',
                                message: 'Something went wrong !'
                            });
                        } else {
                            res.status(200).json({
                                status: 'success',
                                message: 'Login Success',
                                user: user
                            });
                        }
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        message: 'Login Success',
                        user: user
                    });
                }
            });
        });
    } catch {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});

// RESET PASSWORD
route.post('/api/resetPassword', async (req, res) => {
    // const {email, currentEncCode, newPasswordEncCode} = req.body;
    try {
        let user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            user = await ChemistSignUp.findOne({
                email: req.body.email
            });
        }
        if (!user) {
            return res.status(401).json({
                status: 'Fail',
                message: 'Email is not registered.'
            });
        }
        // const result = await bCrypt.compare(req.body.password, user.password);
        // if (!result) {
        //     return res.status(401).json({
        //         status: 'Fail',
        //         message: 'Auth Failed ! Your Password is Incorrect.'
        //     });
        // }
        res.status(200).json({
            status: 'Success',
            message: 'data fetch successfully.',
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});

// RESET PASSWORD UPDATED
route.post('/api/resetPassword/update', async (req, res) => {
    // const {email, currentEncCode, newPasswordEncCode} = req.body;
    try {
        let user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            user = await ChemistSignUp.findOne({
                email: req.body.email
            });
        }
        if (!user) {
            return res.status(401).json({
                status: 'Fail',
                message: 'Email is not registered.'
            });
        }
        const result = await bCrypt.compare(req.body.currentEncCode, user.password);
        if (!result) {
            return res.status(401).json({
                status: 'Fail',
                message: 'Auth Failed ! Your Current Password is Incorrect.'
            });
        }
        const hashedPassword = await bCrypt.hash(req.body.newPasswordEncCode, 10);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 'Success',
            message: 'Password Reset Successfully.',
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});


route.post('/api/user/validateUserForOrder', async (req, res) => {
    console.log(req.body)
    const userId = req.body.userId;
    try {
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(401).json({
                status: 'Fail',
                message: 'User does not exist.'
            });
        }
        res.status(200).json({
            status: 'Success',
            message: 'User Exist',
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: err.message,
        });
    }
});

module.exports = route;