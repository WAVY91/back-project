const express = require('express');
const router = express.Router();

const { getAllCampaigns } = require('../controllers/admin.controllers');
const {
    createCampaign,
    getNGOCampaigns,
    updateCampaign,
    deleteCampaign
} = require('../controllers/ngo.controllers');

// =====================
// ADMIN
// =====================
// Get all campaigns (admin use)
router.get('/all', getAllCampaigns);

// =====================
// NGO
// =====================
// Create a campaign
router.post('/add', createCampaign);

// Get all campaigns created by a specific NGO
router.get('/ngo/:ngoId', getNGOCampaigns);

// Update a campaign
router.patch('/:campaignId', updateCampaign);

// Delete a campaign
router.delete('/:campaignId', deleteCampaign);

module.exports = router;
