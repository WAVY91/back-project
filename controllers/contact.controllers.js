const Contact = require('../models/contact.models')
const nodemailer = require('nodemailer')

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
})

const sendContactNotificationEmail = async (contactData) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: `New Contact Message: ${contactData.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #333;">New Contact Message</h2>
                    <p><strong>From:</strong> ${contactData.name}</p>
                    <p><strong>Email:</strong> ${contactData.email}</p>
                    <p><strong>Subject:</strong> ${contactData.subject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px;">
                        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <p style="color: #999; font-size: 14px;"><strong>Received at:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        }
        await transporter.sendMail(mailOptions)
        console.log('Admin notification email sent successfully')
    } catch (err) {
        console.error('Error sending admin notification email:', err)
    }
}

const sendContactConfirmationEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: userEmail,
            subject: 'We received your message',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #333;">Hello ${userName},</h2>
                    <p style="color: #666; font-size: 16px;">Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
                    <p style="color: #666; font-size: 16px;">We appreciate your interest and look forward to assisting you!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }
        await transporter.sendMail(mailOptions)
        console.log('User confirmation email sent successfully')
    } catch (err) {
        console.error('Error sending user confirmation email:', err)
    }
}

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

        await Promise.all([
            sendContactNotificationEmail({
                name,
                email,
                subject,
                message
            }),
            sendContactConfirmationEmail(email, name)
        ])

        res.status(201).json({
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
