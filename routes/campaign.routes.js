const express = require('express')
const router = express.Router()
const { getAllCampaigns } = require('../controllers/admin.controllers')
const { createCampaign } = require('../controllers/ngo.controllers')

router.get('/all', getAllCampaigns)
router.post('/add', createCampaign)

module.exports = router
