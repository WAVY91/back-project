const express = require('express');
const router = express.Router();

const { getAllCampaigns } = require('../controllers/admin.controllers');
const {
    createCampaign,
    getNGOCampaigns,
    updateCampaign,
    deleteCampaign
} = require('../controllers/ngo.controllers');

router.get('/all', getAllCampaigns);

router.post('/add', createCampaign);

router.get('/ngo/:ngoId', getNGOCampaigns);

router.patch('/:campaignId', updateCampaign);

router.delete('/:campaignId', deleteCampaign);

module.exports = router;
