const Contact = require('../models/contact.models')
const { sendContactNotificationEmail, sendConfirmationEmail } = require('../utils/emailService')

const submitMessage = async (req, res) => {
    const { name, email, subject, message } = req.body

    try {
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const newMessage = await Contact.create({
            name,
            email,
            subject,
            message,
        })

        await sendContactNotificationEmail({
            name,
            email,
            subject,
            message
        })

        await sendConfirmationEmail(email, name)

        return res.status(201).json({
            success: true,
            message: "Message sent successfully! We'll get back to you soon.",
            data: newMessage
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error" })
    }
}

const getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 })
        res.status(200).json({ success: true, data: messages })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error" })
    }
}

const getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params
        const message = await Contact.findById(messageId)

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" })
        }

        res.status(200).json({ success: true, data: message })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error" })
    }
}

const markAsAttended = async (req, res) => {
    try {
        const { messageId } = req.params
        const message = await Contact.findByIdAndUpdate(
            messageId,
            { attended: true, attendedAt: new Date() },
            { new: true }
        )

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" })
        }

        res.status(200).json({
            success: true,
            message: "Message marked as attended",
            data: message
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error" })
    }
}

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params
        const message = await Contact.findByIdAndDelete(messageId)

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" })
        }

        res.status(200).json({ success: true, message: "Message deleted successfully" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server Error" })
    }
}

module.exports = {
    submitMessage,
    getAllMessages,
    getMessageById,
    markAsAttended,
    deleteMessage
}
