const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const NGO = require('../models/ngo.models')
const nodemailer = require('nodemailer')

const JWT_SECRET = process.env.JWT_SECRET
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
})

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
        console.log('NGO welcome email sent successfully')
    } catch (err) {
        console.error('Error sending NGO welcome email:', err)
    }
}

const postNGOSignUp = async (req, res) => {
    const {name, email, password, ngoName, description} = req.body
    
    try {
    if (!name || !email || !password || !ngoName || !description) {
        return res.status(400).json({ success: false, message: "Contact person name, email, password, organization name, and description are required" });
    }

    const existingNGO = await NGO.findOne({ email });
    if (existingNGO) {
        return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newNGO = await NGO.create({
        name,
        email,
        password: hashedPassword,
        ngoName,
        ngoDescription: description,
        registrationStatus: 'pending_verification'
    });

    res.status(201).json({ 
        success: true, 
        message: "NGO signup successful! Pending verification. Welcome email sent.", 
        user: { 
            id: newNGO._id, 
            name: newNGO.name, 
            email: newNGO.email 
        } 
    });

    sendNGOWelcomeEmail(name, email, ngoName).catch(err => console.error('Background task error:', err))

    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
}

const postNGOSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required!" });
    }

    const ngo = await NGO.findOne({ email });
    if (!ngo) {
        return res.status(401).json({ success: false, message: "NGO not found" });
    }

    const isMatch = await bcrypt.compare(password, ngo.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials entry" });
    }

    if (ngo.registrationStatus === 'rejected') {
        return res.status(403).json({ success: false, message: "Your registration has been rejected" });
    }

    const token = jwt.sign(
        { id: ngo._id, name: ngo.name, email: ngo.email, role: 'ngo' },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    return res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
        user: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        role: 'ngo',
        registrationStatus: ngo.registrationStatus
        },
    });

    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getNGOs = async (req, res) => {
    try {
        const ngos = await NGO.find().select('name email description registrationStatus contactPerson address');
        return res.status(200).json({ success: true, data: ngos });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {postNGOSignUp, postNGOSignIn, getNGOs}
