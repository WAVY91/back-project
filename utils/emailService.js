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

const sendDonorWelcomeEmail = async (donorName, donorEmail) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: donorEmail,
            subject: 'Welcome to Good Heart Charity Platform!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #333;">Welcome, ${donorName}!</h2>
                    <p style="color: #666; font-size: 16px;">Your signup was successful.</p>
                    <p style="color: #666; font-size: 16px;">Thank you for joining Good Heart Charity Platform. Your contribution makes a difference!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        return { success: true, message: 'Donor welcome email sent' }
    } catch (err) {
        console.error('Error sending donor welcome email:', err)
        return { success: false, message: 'Failed to send welcome email' }
    }
}

const sendNGOWelcomeEmail = async (ngoContactName, ngoEmail, ngoName) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: ngoEmail,
            subject: 'Welcome to Good Heart Charity Platform!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #333;">Welcome, ${ngoContactName}!</h2>
                    <p style="color: #666; font-size: 16px;"><strong>${ngoName}</strong> has been successfully registered on Good Heart Charity Platform.</p>
                    <p style="color: #666; font-size: 16px;">Your account is currently pending verification. Our team will review your information and notify you shortly.</p>
                    <p style="color: #666; font-size: 16px;">We appreciate your dedication to charitable work and look forward to collaborating with you!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        return { success: true, message: 'NGO welcome email sent' }
    } catch (err) {
        console.error('Error sending NGO welcome email:', err)
        return { success: false, message: 'Failed to send welcome email' }
    }
}

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
        console.log('✅ Admin notification email sent to:', ADMIN_EMAIL)
        return { success: true, message: 'Email sent to admin' }
    } catch (err) {
        console.error('❌ Error sending admin notification email:', err.message)
        return { success: false, message: 'Failed to send email notification' }
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
        console.log('✅ User confirmation email sent to:', userEmail)
        return { success: true, message: 'Confirmation email sent' }
    } catch (err) {
        console.error('❌ Error sending user confirmation email:', err.message)
        return { success: false, message: 'Failed to send confirmation email' }
    }
}

const sendDonationNotificationToNGO = async (ngoEmail, ngoName, campaignTitle, donorName, amount) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: ngoEmail,
            subject: `New Donation Received for ${campaignTitle}!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #28a745;">Thank You for Your Trust!</h2>
                    <p style="color: #666; font-size: 16px;">Great news, <strong>${ngoName}</strong>!</p>
                    <p style="color: #666; font-size: 16px;">Your campaign <strong>${campaignTitle}</strong> has received a new donation!</p>
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #28a745; border-radius: 4px; margin: 15px 0;">
                        <p><strong>Donor Name:</strong> ${donorName}</p>
                        <p><strong>Donation Amount:</strong> $${amount}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p style="color: #666; font-size: 16px;">Every contribution brings you closer to your goal. Thank you for making a difference!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        return { success: true, message: 'Donation notification sent to NGO' }
    } catch (err) {
        console.error('Error sending donation notification to NGO:', err)
        return { success: false, message: 'Failed to send donation notification' }
    }
}

const sendDonationConfirmationToDonor = async (donorEmail, donorName, campaignTitle, amount, totalDonorsCount) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: donorEmail,
            subject: `Thank You for Your Donation to ${campaignTitle}!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #28a745;">Thank You, ${donorName}!</h2>
                    <p style="color: #666; font-size: 16px;">Your generous donation of <strong>$${amount}</strong> to <strong>${campaignTitle}</strong> has been received successfully!</p>
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px; margin: 15px 0;">
                        <p><strong>Campaign:</strong> ${campaignTitle}</p>
                        <p><strong>Amount Donated:</strong> $${amount}</p>
                        <p><strong>Total Campaign Donors:</strong> ${totalDonorsCount}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p style="color: #666; font-size: 16px;">Your contribution is making a real difference in people's lives. Thank you for your compassion and support!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        return { success: true, message: 'Donation confirmation sent to donor' }
    } catch (err) {
        console.error('Error sending donation confirmation to donor:', err)
        return { success: false, message: 'Failed to send donation confirmation' }
    }
}

module.exports = {
    sendDonorWelcomeEmail,
    sendNGOWelcomeEmail,
    sendContactNotificationEmail,
    sendContactConfirmationEmail,
    sendDonationNotificationToNGO,
    sendDonationConfirmationToDonor
}
