const express = require('express')
const router = express.Router()
const {postAdminSignUp, postAdminSignIn, getPendingNGOs, getAllNGOs, approveNGO, rejectNGO, getAllContactMessages, getUnattendedMessages, markContactAsAttended, deleteContactMessage} = require('../controllers/admin.controllers')

router.post('/signup', postAdminSignUp)
router.post('/signin', postAdminSignIn)
router.get('/pending-ngos', getPendingNGOs)
router.get('/all-ngos', getAllNGOs)
router.patch('/approve-ngo/:ngoId', approveNGO)
router.patch('/reject-ngo/:ngoId', rejectNGO)
router.get('/contact-messages/all', getAllContactMessages)
router.get('/contact-messages/unattended', getUnattendedMessages)
router.patch('/contact-messages/:messageId/attended', markContactAsAttended)
router.delete('/contact-messages/:messageId', deleteContactMessage)

module.exports = router
