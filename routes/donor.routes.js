const express = require('express')
const router = express.Router()
const {getSignUp, getSignIn, postSignUp, postSignIn, getAllDonors, getActiveCampaigns, getCampaignById, donateToCampaign, getDonorDonationHistory} = require('../controllers/donor.controllers')

router.get('/signup', getSignUp)
router.get('/signin', getSignIn)
router.post('/signup', postSignUp)
router.post('/signin', postSignIn)
router.get('/all', getAllDonors)
router.get('/campaigns/active', getActiveCampaigns)
router.get('/campaigns/:campaignId', getCampaignById)
router.post('/campaigns/:campaignId/donate', donateToCampaign)
router.get('/:donorId/donation-history', getDonorDonationHistory)

router.post('/submit', (req, res) => {
    const { campaignId, ...donationData } = req.body
    if (!campaignId) {
        return res.status(400).json({ success: false, message: 'campaignId is required' })
    }
    req.params.campaignId = campaignId
    donateToCampaign(req, res)
})

module.exports = router
