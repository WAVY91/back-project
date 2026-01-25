const express = require('express')
const router = express.Router()
const { getAllCampaigns } = require('../controllers/admin.controllers')
const { createCampaign, updateCampaign } = require('../controllers/ngo.controllers')

router.get('/all', getAllCampaigns)
router.post('/add', createCampaign)
router.patch('/:campaignId', updateCampaign)

module.exports = router
