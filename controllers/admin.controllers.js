const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin.models')
const NGO = require('../models/ngo.models')
const Contact = require('../models/contact.models')

const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

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
            { status: 'active', verified: true },
            { new: true }
        ).select('-password');
        
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }
        
        res.status(200).json({ success: true, message: "NGO approved successfully!", data: ngo });
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
            { status: 'rejected' },
            { new: true }
        ).select('-password');
        
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }
        
        res.status(200).json({ success: true, message: "NGO rejected", data: ngo });
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
