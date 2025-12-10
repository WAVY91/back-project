const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin.models')
const NGO = require('../models/ngo.models')
const Contact = require('../models/contact.models')
const nodemailer = require('nodemailer')

const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
})

const sendNGOApprovalEmail = async (ngoEmail, ngoName, contactPersonName) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: ngoEmail,
            subject: 'NGO Registration Approved - Good Heart Charity Platform',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #28a745;">Congratulations, ${contactPersonName}!</h2>
                    <p style="color: #666; font-size: 16px;">Your NGO <strong>${ngoName}</strong> has been approved and verified on Good Heart Charity Platform.</p>
                    <p style="color: #666; font-size: 16px;">You can now log in and access all platform features to connect with donors and manage your charitable initiatives.</p>
                    <p style="color: #666; font-size: 16px;">Thank you for your dedication to making a difference!</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }
        await transporter.sendMail(mailOptions)
        console.log('NGO approval email sent successfully')
    } catch (err) {
        console.error('Error sending NGO approval email:', err)
    }
}

const sendNGORejectionEmail = async (ngoEmail, ngoName, contactPersonName) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: ngoEmail,
            subject: 'NGO Registration Update - Good Heart Charity Platform',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                    <h2 style="color: #dc3545;">Registration Status Update</h2>
                    <p style="color: #666; font-size: 16px;">Dear ${contactPersonName},</p>
                    <p style="color: #666; font-size: 16px;">Thank you for your interest in registering <strong>${ngoName}</strong> on Good Heart Charity Platform.</p>
                    <p style="color: #666; font-size: 16px;">After careful review, your registration has been rejected. Please contact our support team for more information.</p>
                    <p style="color: #666; font-size: 16px;">We encourage you to apply again in the future.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">Best regards,<br><strong>Good Heart Charity Team</strong></p>
                </div>
            `
        }
        await transporter.sendMail(mailOptions)
        console.log('NGO rejection email sent successfully')
    } catch (err) {
        console.error('Error sending NGO rejection email:', err)
    }
}

const postAdminSignUp = async (req, res) => {
    const { email, password } = req.body
    
    try {
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (email !== ADMIN_EMAIL) {
        return res.status(403).json({ success: false, message: "Unauthorized email" });
    }

    const strongPasswordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
        success: false,
        message: "Password must be 8+ chars with uppercase, lowercase, number & special char",
        });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
        email,
        password: hashedPassword,
    });

    return res.status(201).json({ success: true, message: "Admin signup successful!" });

    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
}

const postAdminSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.status(401).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    return res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
        user: {
            id: admin._id,
            name: 'Admin User',
            email: admin.email,
            role: 'admin',
        },
    });

    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getPendingNGOs = async (req, res) => {
    try {
        const pendingNGOs = await NGO.find({ status: 'pending' }).select('-password');
        res.status(200).json({ success: true, data: pendingNGOs });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const approveNGO = async (req, res) => {
    try {
        const { ngoId } = req.params;
        const ngo = await NGO.findByIdAndUpdate(
            ngoId,
            { status: 'active', verified: true, registrationStatus: 'approved' },
            { new: true }
        ).select('-password');
        
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }

        sendNGOApprovalEmail(ngo.email, ngo.ngoName, ngo.name).catch(err => console.error('Background task error:', err))
        
        res.status(200).json({ success: true, message: "NGO approved successfully! Approval email sent.", data: ngo });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const rejectNGO = async (req, res) => {
    try {
        const { ngoId } = req.params;
        const ngo = await NGO.findByIdAndUpdate(
            ngoId,
            { status: 'rejected', registrationStatus: 'rejected' },
            { new: true }
        ).select('-password');
        
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }

        sendNGORejectionEmail(ngo.email, ngo.ngoName, ngo.name).catch(err => console.error('Background task error:', err))
        
        res.status(200).json({ success: true, message: "NGO rejected! Rejection email sent.", data: ngo });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllNGOs = async (req, res) => {
    try {
        const ngos = await NGO.find().select('-password');
        res.status(200).json({ success: true, data: ngos });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllContactMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getUnattendedMessages = async (req, res) => {
    try {
        const messages = await Contact.find({ attended: false }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const markContactAsAttended = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Contact.findByIdAndUpdate(
            messageId,
            { attended: true, attendedAt: new Date() },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        res.status(200).json({ success: true, message: "Message marked as attended", data: message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteContactMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Contact.findByIdAndDelete(messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        res.status(200).json({ success: true, message: "Message deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {postAdminSignUp, postAdminSignIn, getPendingNGOs, approveNGO, rejectNGO, getAllNGOs, getAllContactMessages, getUnattendedMessages, markContactAsAttended, deleteContactMessage}
