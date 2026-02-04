const express = require('express');
const router = express.Router();
const { 
    submitDonation,
    getDonationsByDonor,
    getDonationsByNGO,
    getAllDonations
} = require('../controllers/donation.controllers');

// POST routes for submitting donations
router.post('/submit', submitDonation);
router.post('/add', submitDonation);

// GET routes for retrieving donations
router.get('/donor/:donorId', getDonationsByDonor);
router.get('/ngo/:ngoId', getDonationsByNGO);
router.get('/all', getAllDonations);

module.exports = router;
