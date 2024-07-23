const express = require('express')
const router = express.Router();
const medicalList = require('../models/medicalLists');
const checkUth = require('../middileware/user-auth');

router.post('/api/user/getMedicalLists', async (req, res, next) => {
    try {
        const { area, city, coordinate } = req.body;
        // Define the condition based on the presence of area or city
        let condition;
        condition = { area, isActive: true, isBlock: false };
        const medicalListEntry = await medicalList.find(condition);
        if (medicalListEntry.length > 0) {
          console.log('1')
            res.status(200).json({
              status: 'success',
              message: 'Data fetch success',
              medicalLists: medicalListEntry,
            });
        } else {
          const maxDistance = 7; // 7 km
          const medicalListEntryByCity = await medicalList.find();
          const nearbyMedicalList = medicalListEntryByCity.filter(entry => {
            const distance = getDistanceFromLatLonInKm(coordinate.lat, coordinate.lng, entry.lat, entry.lng);
            return (distance <= maxDistance && entry.isActive && !entry.isBlock)
          });
          if (nearbyMedicalList.length > 0) {
            res.status(200).json({
              status: 'success',
              message: 'Data fetch success',
              medicalLists: nearbyMedicalList,
            });
          } else {
            condition = { city, isActive: true, isBlock: false };
            const medicalListEntryByCity = await medicalList.find(condition);
            if (medicalListEntry.length > 0) {
              res.status(200).json({
                status: 'success',
                message: 'Data fetch success',
                medicalLists: medicalListEntryByCity,
              });
            }
          }
        }
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Error fetching medical list:', error,
        });
      }
    });

    // Haversine formula functions
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

    // Search
    router.post('/api/user/getMedicalListsSearch', (req, res, next) => {
        const searchKey = req.body.searchKey || '';
        const coordinate = req.body.coordinate || '';
        const regex = new RegExp(searchKey, 'i');
        medicalList.find({
          // city: req.body.city, 
          isActive: true, 
          isBlock: false,
          title: {$regex: regex}
        }).then((data) => {
          if (data.length > 0) {
            const maxDistance = 7; // 7 km
            const nearByMedicalList = data.filter(entry => {
              const distance = getDistanceFromLatLonInKm(coordinate.lat, coordinate.lng, entry.lat, entry.lng);
              return distance <= maxDistance 
            });
            res.status(200).json({
                status: "success",
                message: 'data fetch success',
                medicalLists: nearByMedicalList
            });
          } else {
            res.status(200).json({
              status: "success",
              message: 'data fetch success',
              medicalLists: data
          });
          }
        })
    }); 

    // Get Medical By Chemist SignUpID
    router.post('/api/user/getMedicalListsByChemistId', (req, res, next) => {
        medicalList.find({
          isActive: true, 
          isBlock: false, 
          chemistSignUpId: req.body.chemistSignUpId
        }).then((data) => {
            res.status(200).json({
                status: "success",
                message: 'data fetch success',
                medicalLists: data
            });
        })
        });

module.exports = router;