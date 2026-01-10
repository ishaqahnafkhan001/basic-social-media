const { Tour, validateTour } = require('../../models/tour/tour');
const { Review,validateReview } = require('../../models/reviews/reviews');


// --------------------- 1. Create Tour ---------------------
const createTour = async (req, res) => {
    try {
        let tourData = { ...req.body };

        // 👇 FIX: Add 'itinerary', 'inclusions', 'exclusions' to this list
        // These fields arrive as JSON strings from FormData and must be parsed.
        const fieldsToParse = [
            'startDates',
            'locations',
            'faqs',
            'itinerary',   // <--- Added
            'inclusions',  // <--- Added
            'exclusions'   // <--- Added
        ];

        fieldsToParse.forEach(field => {
            if (typeof tourData[field] === 'string') {
                try {
                    tourData[field] = JSON.parse(tourData[field]);
                } catch (e) {
                    console.error(`Error parsing ${field}:`, e);
                    // If parsing fails, validation will likely catch it later
                }
            }
        });

        // 3. Add Image URLs from Cloudinary
        if (req.files) {
            if (req.files.coverImage) {
                tourData.coverImage = req.files.coverImage[0].path;
            }
            if (req.files.images) {
                tourData.images = req.files.images.map(file => file.path);
            }
        }

        // 4. Inject Agency ID
        tourData.agency = req.user._id.toString();

        // 5. Joi Validation (Validate the PROCESSED object, not raw req.body)
        const { error } = validateTour(tourData);
        if (error) {
            // Delete uploaded files if validation fails? (Optional but good practice)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // 6. Save to Database
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
        // 1. Destructure & Parse Query Params (Sanitization)
        const {
            page,
            limit,
            sort = '-createdAt',
            country,
            category,
            minPrice,
            maxPrice
        } = req.query;

        // 2. Default & Safety Logic for Pagination
        // Ensure page is at least 1
        const pageNumber = Math.max(1, parseInt(page) || 1);

        // Ensure limit is at least 1, and MAX 100 (to prevent server crash)
        const limitNumber = Math.max(1, Math.min(100, parseInt(limit) || 10));

        // Calculate Skip
        const skip = (pageNumber - 1) * limitNumber;

        // 3. Build the Filtering Query
        const query = { isActive: true };

        if (country) query.destinationCountry = country;
        if (category) query.category = category;

        // Price Filter Handling
        if (minPrice || maxPrice) {
            query.pricePerPerson = {};
            if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
            if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
        }

        // 4. Execute the Query
        const tours = await Tour.find(query)
            .populate('agency', 'name email') // Populate Agency details
            .sort(sort)
            .skip(skip)          // Jumps over previous pages
            .limit(limitNumber)  // Limits the results
            .select('-__v');     // Clean up output

        // 5. Get Total Count (for frontend pagination UI)
        // We count documents matching the *filter*, not just all documents
        const count = await Tour.countDocuments(query);

        // 6. Send Response
        res.status(200).json({
            success: true,
            count: count,                // Total matching items in DB
            results: tours.length,       // Items in this specific response
            currentPage: pageNumber,
            totalPages: Math.ceil(count / limitNumber),
            data: tours
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};
// --------------------- 3. Get Single Tour ---------------------
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
            // 👇 UPDATE THIS LINE: Add 'ratingsAverage' and 'ratingsQuantity'
            .populate('agency', 'name email profilePictureUrl ratingsAverage ratingsQuantity')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name profilePictureUrl' }
            });

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
        // 1. FETCH EXISTING TOUR (Critical: You need this before doing checks)
        const tour = await Tour.findById(req.params.id);

        if (!tour) {
            return res.status(404).json({ success: false, message: "Tour not found" });
        }

        // 2. CHECK OWNERSHIP
        if (tour.agency.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this tour" });
        }

        // 3. PREPARE UPDATES OBJECT
        // Renamed from 'tourData' to 'updates' so it matches your logic below
        let updates = { ...req.body };

        // 4. PARSE JSON STRINGS (Fix for FormData)
        const fieldsToParse = [
            'startDates',
            'locations',
            'faqs',
            'itinerary',
            'inclusions',
            'exclusions'
        ];

        fieldsToParse.forEach(field => {
            if (typeof updates[field] === 'string') {
                try {
                    updates[field] = JSON.parse(updates[field]);
                } catch (e) {
                    console.error(`Error parsing ${field}`, e);
                    // If parsing fails, remove the field so it doesn't crash Mongoose
                    delete updates[field];
                }
            }
        });

        // 5. HANDLE FILE UPLOADS
        if (req.files) {
            // Handle Cover Image
            if (req.files.coverImage) {
                updates.coverImage = req.files.coverImage[0].path;
            }

            // Handle Gallery Images (Replaces existing gallery)
            if (req.files.images) {
                updates.images = req.files.images.map(file => file.path);
            }
        }

        // 6. VALIDATION (Merge existing data with updates)
        const currentTourData = tour.toObject();
        delete currentTourData._id;
        delete currentTourData.__v;
        delete currentTourData.createdAt;
        delete currentTourData.updatedAt;

        const mergedDataForValidation = {
            ...currentTourData,
            ...updates, // Now 'updates' contains the parsed arrays and new image URLs
            agency: tour.agency.toString()
        };

        const { error } = validateTour(mergedDataForValidation, true); // true = update mode
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // 7. PERFORM UPDATE
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: updatedTour
        });

    } catch (err) {
        console.error("Update Tour Error:", err);
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};// --------------------- 5. Delete Tour ---------------------
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
        // 1. Get the logged-in Agency's ID (from authMiddleware)
        const agencyId = req.user._id;

        // 2. Pagination Setup (Same logic as getAllTours)
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        // 3. Define the Query
        // CRITICAL: We hardcode the 'agency' field to the current user
        const query = { agency: agencyId };

        // 4. Execute Query with Pagination
        const tours = await Tour.find(query)
            .sort('-createdAt') // Sort by newest first by default
            .skip(skip)
            .limit(limit)
            .populate('agency', 'name email'); // Optional: populate if needed

        // 5. Get count for valid pagination numbers
        const count = await Tour.countDocuments(query);

        // 6. Send Response
        res.status(200).json({
            success: true,
            count,
            results: tours.length,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            data: tours
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
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
