const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const Donor = require('../models/donor.models')

const JWT_SECRET = process.env.JWT_SECRET
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const getSignUp = (req, res) => {
    res.send('signup')
}

const getSignIn = (req, res) => {
    res.send('signin')
}

const postSignUp = async (req, res) => {
    const {name, email, password} = req.body
    
    try {
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
        return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDonor = await Donor.create({
        name,
        email,
        password: hashedPassword,
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Welcome to Good Heart Charity Platform!",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome, ${name}!</h2>
            <p>Your signup was successful.</p>
        </div>
        `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log("Email send error:", err);
        else console.log("Email sent:", info.response);
    });

    return res.status(201).json({ success: true, message: "Signup successful!", user: { id: newDonor._id, name: newDonor.name, email: newDonor.email } });

    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
}

const postSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required!" });
    }

    const donor = await Donor.findOne({ email });
    if (!donor) {
        return res.status(401).json({ success: false, message: "Donor not found" });
    }

    const isMatch = await bcrypt.compare(password, donor.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials entry" });
    }

    const token = jwt.sign(
        { id: donor._id, name: donor.name, email: donor.email, role: 'donor' },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    return res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
        user: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        role: 'donor'
        },
    });

    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllDonors = async (req, res) => {
    try {
        const donors = await Donor.find().select('-password');
        res.status(200).json({ success: true, data: donors });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {getSignUp, getSignIn, postSignUp, postSignIn, getAllDonors}
