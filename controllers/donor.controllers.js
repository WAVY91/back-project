const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Donor = require('../models/donor.models')
const { sendDonorWelcomeEmail } = require('../utils/emailService')

const JWT_SECRET = process.env.JWT_SECRET

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

    await sendDonorWelcomeEmail(name, email);

    return res.status(201).json({ 
        success: true, 
        message: "Signup successful! Welcome email sent.", 
        user: { 
            id: newDonor._id, 
            name: newDonor.name, 
            email: newDonor.email 
        } 
    });

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
