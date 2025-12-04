const express = require('express')
const router = express.Router()
const {
    submitMessage,
    getAllMessages,
    getMessageById,
    markAsAttended,
    deleteMessage
} = require('../controllers/contact.controllers')

router.post('/submit', submitMessage)
router.get('/all', getAllMessages)
router.get('/:messageId', getMessageById)
router.patch('/:messageId/mark-attended', markAsAttended)
router.delete('/:messageId', deleteMessage)

module.exports = router
