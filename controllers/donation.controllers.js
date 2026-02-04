const Campaign = require('../models/campaign.models');
const Donor = require('../models/donor.models');
const NGO = require('../models/ngo.models');
const { sendDonationConfirmationToDonor, sendDonationNotificationToNGO } = require('../utils/emailService');

const submitDonation = async (req, res) => {
    try {
        const { campaignId, donorId, amount: rawAmount } = req.body;
        const amount = Number(rawAmount);

        if (!campaignId || !donorId || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Campaign ID, Donor ID and positive amount are required" });
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
            existingDonation.amount += amount;
            existingDonation.donatedAt = new Date();
        }

        campaign.raisedAmount += amount;
        await campaign.save();

        const ngoUpdate = {
            $inc: { totalRaisedAmount: amount }
        };
        if (isNewDonor) {
            ngoUpdate.$inc.totalDonors = 1;
        }
        await NGO.findByIdAndUpdate(campaign.ngoId._id, ngoUpdate);

        const donorUpdate = {
            $inc: { totalAmountDonated: amount }
        };
        if (isNewDonor) {
            donorUpdate.$inc.totalDonations = 1;
        }
        await Donor.findByIdAndUpdate(donorId, donorUpdate);

        try {
            await Promise.all([
                sendDonationConfirmationToDonor(donor.email, donor.name, campaign.title, amount, campaign.totalDonorsCount),
                sendDonationNotificationToNGO(campaign.ngoId.email, campaign.ngoId.ngoName, campaign.title, donor.name, amount)
            ]);
        } catch (emailErr) {
            console.error('Error sending donation emails:', emailErr);
        }

        res.status(200).json({
            success: true,
            message: `Donation of $${amount} received successfully!`,
            data: {
                campaignId: campaign._id,
                campaignTitle: campaign.title,
                amount,
                totalRaisedAmount: campaign.raisedAmount,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all donations by a specific donor
const getDonationsByDonor = async (req, res) => {
    try {
        const { donorId } = req.params;

        if (!donorId) {
            return res.status(400).json({ success: false, message: "Donor ID is required" });
        }

        // Find all campaigns that have donations from this donor
        const campaigns = await Campaign.find({ 'donors.donorId': donorId }).populate('ngoId', 'ngoName email');

        // Extract and format donations
        const donations = [];
        campaigns.forEach(campaign => {
            const donorDonations = campaign.donors.filter(d => d.donorId.toString() === donorId);
            donorDonations.forEach(donation => {
                donations.push({
                    _id: donation._id,
                    campaignId: campaign._id,
                    campaignTitle: campaign.title,
                    ngoName: campaign.ngoId?.ngoName,
                    amount: donation.amount,
                    donatedAt: donation.donatedAt,
                    donorId: donation.donorId
                });
            });
        });

        res.status(200).json({
            success: true,
            data: donations
        });
    } catch (err) {
        console.error('Error fetching donor donations:', err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all donations for a specific NGO's campaigns
const getDonationsByNGO = async (req, res) => {
    try {
        const { ngoId } = req.params;

        if (!ngoId) {
            return res.status(400).json({ success: false, message: "NGO ID is required" });
        }

        // Find all campaigns belonging to this NGO
        const campaigns = await Campaign.find({ ngoId }).populate('donors.donorId', 'name email');

        // Extract and format donations
        const donations = [];
        campaigns.forEach(campaign => {
            campaign.donors.forEach(donation => {
                donations.push({
                    _id: donation._id,
                    campaignId: campaign._id,
                    campaignTitle: campaign.title,
                    donorName: donation.donorId?.name,
                    donorEmail: donation.donorId?.email,
                    amount: donation.amount,
                    donatedAt: donation.donatedAt,
                    donorId: donation.donorId?._id
                });
            });
        });

        res.status(200).json({
            success: true,
            data: donations
        });
    } catch (err) {
        console.error('Error fetching NGO donations:', err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all donations (admin only)
const getAllDonations = async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .populate('ngoId', 'ngoName email')
            .populate('donors.donorId', 'name email');

        const donations = [];
        campaigns.forEach(campaign => {
            campaign.donors.forEach(donation => {
                donations.push({
                    _id: donation._id,
                    campaignId: campaign._id,
                    campaignTitle: campaign.title,
                    ngoName: campaign.ngoId?.ngoName,
                    donorName: donation.donorId?.name,
                    donorEmail: donation.donorId?.email,
                    amount: donation.amount,
                    donatedAt: donation.donatedAt,
                    donorId: donation.donorId?._id
                });
            });
        });

        res.status(200).json({
            success: true,
            data: donations
        });
    } catch (err) {
        console.error('Error fetching all donations:', err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { 
    submitDonation,
    getDonationsByDonor,
    getDonationsByNGO,
    getAllDonations
};
