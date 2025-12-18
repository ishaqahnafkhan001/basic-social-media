const { VerificationRequest, validateVerificationRequest } = require('../models/request/verificationRequest');
const { User } = require('../models/user/user');

// 1. CREATE NEW REQUEST (User submits this)
const createRequest = async (req, res) => {
    try {
        // A. Parse FormData
        // Frontend sends 'address' and 'verificationData' as JSON strings
        let address = {};
        let verificationData = {};

        try {
            if (req.body.address) address = JSON.parse(req.body.address);
            if (req.body.verificationData) verificationData = JSON.parse(req.body.verificationData);
        } catch (e) {
            return res.status(400).json({ message: "Invalid JSON format in text fields" });
        }

        // B. Check for Image
        if (!req.file) {
            return res.status(400).json({ message: "Document image is required" });
        }

        // C. Construct Data Object
        const requestData = {
            user: req.user.id,
            phoneNumber: req.body.phoneNumber,
            address: address,
            documentType: verificationData.documentType,
            documentNumber: verificationData.documentNumber,
            stripeSubscriptionId: verificationData.stripeSubscriptionId,
            documentImageUrl: req.file.path // Cloudinary URL
        };

        // D. Create Request Record
        const newRequest = await VerificationRequest.create(requestData);

        // E. Update User Profile (Set status to Pending)
        // We also sync the new phone/address to the user profile immediately
        await User.findByIdAndUpdate(req.user.id, {
            phoneNumber: req.body.phoneNumber,
            address: address,
            'verificationData.status': 'pending',
            'verificationData.stripeSubscriptionId': verificationData.stripeSubscriptionId
        });

        res.status(201).json({ message: "Request submitted successfully", request: newRequest });

    } catch (err) {
        console.error("Create Request Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// 2. GET ALL REQUESTS (Admin Only)
const getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await VerificationRequest.find(filter)
            .populate('user', 'name email profilePictureUrl')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// 3. UPDATE STATUS (Admin: Approve/Reject)
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params; // Request ID
        const { status, adminResponse } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const request = await VerificationRequest.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        // A. Update Request Doc
        request.status = status;
        request.adminResponse = adminResponse;
        request.reviewedBy = req.user.id;
        await request.save();

        // B. Update User Doc based on decision
        if (status === 'approved') {
            await User.findByIdAndUpdate(request.user, {
                isVerified: true,
                role: 'agency', // OPTIONAL: Automatically upgrade role to agency?
                'verificationData.status': 'verified',
                'verificationData.documentType': request.documentType,
                'verificationData.documentNumber': request.documentNumber,
                'verificationData.documentUrl': request.documentImageUrl,
                'verificationData.subscriptionExpiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days
            });
        } else if (status === 'rejected') {
            await User.findByIdAndUpdate(request.user, {
                isVerified: false,
                'verificationData.status': 'rejected'
            });
        }

        res.json({ message: `Request ${status} successfully`, request });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createRequest, getAllRequests, updateRequestStatus };