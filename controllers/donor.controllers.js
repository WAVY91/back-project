const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Donor = require('../models/donor.models')
const Campaign = require('../models/campaign.models')
const NGO = require('../models/ngo.models')
const { sendDonorWelcomeEmail, sendDonationConfirmationToDonor, sendDonationNotificationToNGO } = require('../utils/emailService')

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

    let emailResult = { success: false, message: 'Welcome email not sent' }
    try {
        emailResult = await sendDonorWelcomeEmail(name, email)
        if (emailResult.success) {
            console.log(`✅ Donor welcome email sent to ${email} for ${name}`)
        } else {
            console.error(`⚠️ Donor welcome email failed: ${emailResult.message}`)
        }
    } catch (err) {
        console.error(`❌ Error sending donor welcome email to ${email}:`, err.message || err)
        emailResult = { success: false, message: err.message || 'Unknown error' }
    }

    res.status(201).json({ 
        success: true, 
        message: `Signup successful! ${emailResult.message || ''}`.trim(), 
        emailSent: !!emailResult.success,
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

const getActiveCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'active' }).populate('ngoId', 'ngoName ngoDescription');
        res.status(200).json({ success: true, data: campaigns });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getCampaignById = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findById(campaignId).populate('ngoId', 'ngoName ngoDescription email');
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        res.status(200).json({ success: true, data: campaign });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const donateToCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { donorId, amount } = req.body;

        if (!donorId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Valid donor ID and positive amount are required" });
        }

        const donor = await Donor.findById(donorId);
        if (!donor) {
            return res.status(404).json({ success: false, message: "Donor not found" });
        }

        const campaign = await Campaign.findById(campaignId).populate('ngoId');
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        if (campaign.status !== 'active') {
            return res.status(403).json({ success: false, message: "This campaign is not currently active" });
        }

        const existingDonation = campaign.donors.find(d => d.donorId.toString() === donorId);
        
        let isNewDonor = false;
        if (!existingDonation) {
            isNewDonor = true;
            campaign.totalDonorsCount += 1;
            campaign.donors.push({
                donorId,
                amount,
                donatedAt: new Date(),
            });
        } else {
            // Existing donor - update their donation
            existingDonation.amount += amount;
            existingDonation.donatedAt = new Date();
        }

        // Update raised amount
        campaign.raisedAmount += amount;
        await campaign.save();

        // Send donation emails
        try {
            await Promise.all([
                sendDonationConfirmationToDonor(donor.email, donor.name, campaign.title, amount, campaign.totalDonorsCount),
                sendDonationNotificationToNGO(campaign.ngoId.email, campaign.ngoId.ngoName, campaign.title, donor.name, amount)
            ]);
        } catch (emailErr) {
            console.error('Error sending donation emails:', emailErr);
            // Continue even if emails fail
        }

        res.status(200).json({
            success: true,
            message: `Donation of $${amount} received successfully! Total donors: ${campaign.totalDonorsCount}`,
            data: {
                campaignId: campaign._id,
                campaignTitle: campaign.title,
                donorName: donor.name,
                amount,
                newDonor: isNewDonor,
                totalDonorsCount: campaign.totalDonorsCount,
                totalRaisedAmount: campaign.raisedAmount,
                goalAmount: campaign.goalAmount,
                percentageReached: ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(2),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getDonorDonationHistory = async (req, res) => {
    try {
        const { donorId } = req.params;

        const campaigns = await Campaign.find({ 'donors.donorId': donorId }).populate('ngoId', 'ngoName');
        
        const donationHistory = campaigns.map(campaign => {
            const donation = campaign.donors.find(d => d.donorId.toString() === donorId);
            return {
                campaignId: campaign._id,
                campaignTitle: campaign.title,
                ngoName: campaign.ngoId.ngoName,
                amount: donation.amount,
                donatedAt: donation.donatedAt,
            };
        });

        res.status(200).json({ success: true, data: donationHistory });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {getSignUp, getSignIn, postSignUp, postSignIn, getAllDonors, getActiveCampaigns, getCampaignById, donateToCampaign, getDonorDonationHistory}
