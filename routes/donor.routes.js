const express = require('express')
const router = express.Router()
const {getSignUp, getSignIn, postSignUp, postSignIn, getAllDonors} = require('../controllers/donor.controllers')

router.get('/signup', getSignUp)
router.get('/signin', getSignIn)
router.post('/signup', postSignUp)
router.post('/signin', postSignIn)
router.get('/all', getAllDonors)

module.exports = router
