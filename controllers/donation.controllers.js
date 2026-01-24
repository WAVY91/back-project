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

        // Update NGO stats
        const ngoUpdate = {
            $inc: { totalRaisedAmount: amount }
        };
        if (isNewDonor) {
            ngoUpdate.$inc.totalDonors = 1;
        }
        await NGO.findByIdAndUpdate(campaign.ngoId._id, ngoUpdate);

        // Update Donor stats
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

module.exports = { submitDonation };
