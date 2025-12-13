const { Tour, validateTour } = require('../../models/tour');

// --------------------- 1. Create Tour ---------------------
const createTour = async (req, res) => {
    try {
        // Inject logged-in agency ID
        const tourData = {
            ...req.body,
            agency: req.user._id.toString()
        };

        // Joi validation
        const { error } = validateTour(tourData);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const savedTour = await new Tour(tourData).save();

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

// --------------------- 2. Get All Tours ---------------------
const getAllTours = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            country,
            category,
            minPrice,
            maxPrice
        } = req.query;

        const query = { isActive: true };

        if (country) query.destinationCountry = country;
        if (category) query.category = category;

        if (minPrice || maxPrice) {
            query.pricePerPerson = {};
            if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
            if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
        }

        const tours = await Tour.find(query)
            // --- POPULATE ADDED HERE ---
            // 1st arg: The field in Tour schema to populate ('agency')
            // 2nd arg: The fields to select from the User schema ('name email profilePicture')
            .populate('agency', 'name email')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select('-__v');

        const count = await Tour.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            currentPage: Number(page),
            totalPages: Math.ceil(count / limit),
            data: tours
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 3. Get Single Tour ---------------------
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
            .populate('agency', 'name email avatar');

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        res.status(200).json({ success: true, data: tour });

    } catch (err) {
        if (err.kind === "ObjectId") {
            return res.status(404).json({ success: false, message: "Invalid ID format" });
        }
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 4. Update Tour ---------------------
const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        // Ownership check
        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update" });
        }

        // 1. Create a merged object for validation
        // We use tour.toObject() to get a clean JS object, then strip internal fields
        const currentTourData = tour.toObject();
        delete currentTourData._id;
        delete currentTourData.__v;
        delete currentTourData.createdAt;
        delete currentTourData.updatedAt;

        // Merge existing data with the new request body
        const updatedData = {
            ...currentTourData,
            ...req.body,
            agency: tour.agency.toString()
        };

        // 2. Validate
        // We pass a second argument 'isUpdate' (explained below) or we accept that
        // startDate validation might fail if strictly enforcing 'greater now'.
        // A quick fix is to allow unknown fields in Joi, but better to clean data as above.

        const { error } = validateTour(updatedData, true); // Pass true to signal an update

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // 3. Perform the Update
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true } // Mongoose validators run here too
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
// --------------------- 5. Delete Tour ---------------------
const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete" });
        }

        await Tour.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Tour deleted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --------------------- 6. Get Tours by Logged-in Agency ---------------------
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
