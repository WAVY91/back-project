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
                <h2>New Contact Message</h2>
                <p><strong>From:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${contactData.message.replace(/\n/g, '<br>')}</p>
                <p><strong>Received at:</strong> ${new Date().toLocaleString()}</p>
            `
        }

        await transporter.sendMail(mailOptions)
        return { success: true, message: 'Email sent to admin' }
    } catch (err) {
        console.error('Error sending email:', err)
        return { success: false, message: 'Failed to send email notification' }
    }
}

const sendConfirmationEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: userEmail,
            subject: 'We received your message',
            html: `
                <h2>Hello ${userName},</h2>
                <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
                <p>Best regards,<br>The Team</p>
            `
        }

        await transporter.sendMail(mailOptions)
        return { success: true, message: 'Confirmation email sent' }
    } catch (err) {
        console.error('Error sending confirmation email:', err)
        return { success: false, message: 'Failed to send confirmation email' }
    }
}

module.exports = {
    sendContactNotificationEmail,
    sendConfirmationEmail
}
