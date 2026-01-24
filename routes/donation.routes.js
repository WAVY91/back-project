const express = require('express');
const router = express.Router();
const { submitDonation } = require('../controllers/donation.controllers');

router.post('/submit', submitDonation);

module.exports = router;
