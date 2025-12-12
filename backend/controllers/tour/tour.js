const { Tour, validateTour } = require('../models/Tour'); // Adjust path as needed

// --- 1. Create a new Tour ---
const createTour = async (req, res) => {
    try {
        // 1. Inject the logged-in user's ID as the agency
        // (Assumes you have auth middleware that sets req.user)
        const tourData = {
            ...req.body,
            agency: req.user ? req.user._id.toString() : req.body.agency
        };

        // 2. Validate using Joi
        const { error } = validateTour(tourData);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // 3. Create and Save
        const newTour = new Tour(tourData);
        const savedTour = await newTour.save();

        res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: savedTour
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

// --- 2. Get All Tours (With Filters, Sort, & Pagination) ---
const getAllTours = async (req, res) => {
    try {
        // Destructure query params for filtering
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt', // Default: newest first
            country,
            category,
            minPrice,
            maxPrice
        } = req.query;

        // Build the query object
        const query = {};

        // Add filters if they exist
        if (country) query.destinationCountry = country;
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.pricePerPerson = {};
            if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
            if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
        }

        // Only show active tours to public
        query.isActive = true;

        // Execute Query
        const tours = await Tour.find(query)
            .sort(sort)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .select('-__v'); // Exclude version key

        // Get total count for pagination frontend logic
        const count = await Tour.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: tours
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --- 3. Get Single Tour by ID ---
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
            .populate('agency', 'name email avatar'); // Populate agency details (exclude password)

        if (!tour) {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }

        res.status(200).json({ success: true, data: tour });

    } catch (err) {
        // Handle invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// --- 4. Update Tour ---
const updateTour = async (req, res) => {
    try {
        // Optional: Add logic to ensure only the owner (agency) can update
        const tour = await Tour.findById(req.params.id);

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        // Check ownership (Pseudo-code, assumes req.user exists)
        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this tour" });
        }

        // Update
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true } // Return new doc & run Mongoose validators
        );

        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: updatedTour
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --- 5. Delete Tour ---
const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        // Check ownership
        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this tour" });
        }

        await Tour.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Tour deleted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --- 6. Get Tours by Agency (For Agency Dashboard) ---
const getMyTours = async (req, res) => {
    try {
        const tours = await Tour.find({ agency: req.user._id });

        res.status(200).json({
            success: true,
            count: tours.length,
            data: tours
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

module.exports = {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
};