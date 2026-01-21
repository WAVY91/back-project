const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const NGO = require('../models/ngo.models')
const Campaign = require('../models/campaign.models')
const { sendNGOWelcomeEmail } = require('../utils/emailService')

const JWT_SECRET = process.env.JWT_SECRET

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
        registrationStatus: 'pending'
    });

    let emailResult = { success: false, message: 'Welcome email not sent' }
    try {
        emailResult = await sendNGOWelcomeEmail(name, email, ngoName)
        if (emailResult.success) {
            console.log(`✅ NGO welcome email sent to ${email} for ${ngoName} (Contact: ${name})`)
        } else {
            console.error(`⚠️ NGO welcome email failed: ${emailResult.message}`)
        }
    } catch (err) {
        console.error(`❌ Error sending NGO welcome email to ${email}:`, err.message || err)
        emailResult = { success: false, message: err.message || 'Unknown error' }
    }

    res.status(201).json({ 
        success: true, 
        message: `NGO signup successful! Pending verification. ${emailResult.message || ''}`.trim(), 
        emailSent: !!emailResult.success,
        user: { 
            id: newNGO._id, 
            name: newNGO.name, 
            email: newNGO.email 
        } 
    });

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
        const ngos = await NGO.find().select('-password');
        return res.status(200).json({ success: true, data: ngos });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createCampaign = async (req, res) => {
    const ngoId = req.params.ngoId || req.body.ngoId;
    const { title, description, goalAmount } = req.body;

    try {
        if (!ngoId) {
            return res.status(400).json({ success: false, message: "NGO ID is required" });
        }
        if (!title || !description || !goalAmount) {
            return res.status(400).json({ success: false, message: "Title, description, and goal amount are required" });
        }

        const ngo = await NGO.findById(ngoId);
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }

        if (ngo.registrationStatus === 'rejected') {
            return res.status(403).json({ success: false, message: "Rejected NGOs cannot create campaigns" });
        }

        if (ngo.registrationStatus === 'pending') {
            return res.status(403).json({ success: false, message: "NGO must be approved before creating campaigns" });
        }

        const newCampaign = await Campaign.create({
            title,
            description,
            ngoId,
            goalAmount,
            status: 'active',
        });

        await NGO.findByIdAndUpdate(ngoId, {
            $push: { campaigns: newCampaign._id }
        });

        console.log(`✅ Campaign created successfully: "${title}" by NGO: ${ngo.ngoName}`);

        res.status(201).json({
            success: true,
            message: "Campaign created successfully and is now live!",
            data: newCampaign,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getNGOCampaigns = async (req, res) => {
    const { ngoId } = req.params;

    try {
        const campaigns = await Campaign.find({ ngoId }).populate('ngoId', 'ngoName');
        res.status(200).json({ success: true, data: campaigns });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {postNGOSignUp, postNGOSignIn, getNGOs, createCampaign, getNGOCampaigns}
