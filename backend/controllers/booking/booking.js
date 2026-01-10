const { Booking, validateBooking } = require('../../models/booking/booking'); // Adjust path
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { User } = require('../../models/user/user'); // Assuming you have this
const { Tour } = require('../../models/tour/tour');
// --- CREATE NEW BOOKING ---
const createBooking = async (req, res) => {
    try {
        const {
            tourId,
            tourName,
            bookAt,
            guestSize,
            totalAmount,
            guestDetails,
            fullName, // Contact Name
            phone     // Contact Phone
        } = req.body;

        // 1. Fetch Tour to find the Agency (Crucial Step)
        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        // 2. Prepare Data for Validation
        // We inject the agencyId manually because the frontend user doesn't need to know it.
        // Assumes your Tour model has a field 'agency' referring to the agency user/id.
        const bookingData = {
            ...req.body,
            agencyId: tour.agency?.toString()
        };

        // 3. Validate
        const { error } = validateBooking(bookingData);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // 4. Get User from Token
        const userId = req.user.id;
        const userEmail = req.user.email || req.body.userEmail;

        // 5. Create Booking Object
        const newBooking = new Booking({
            user: userId,
            tour: tourId,
            agency: tour.agency, // <--- Link the booking to the agency panel

            tourName: tourName || tour.title,
            bookAt: new Date(bookAt),
            guestSize,
            guestDetails,
            totalAmount,
            contactInfo: {
                fullName,
                phone,
                email: userEmail
            },
            status: 'pending', // Starts as pending until paid
            paymentStatus: 'pending'
        });

        // 6. Save
        const savedBooking = await newBooking.save();

        res.status(201).json({
            message: "Booking initialized",
            data: savedBooking
        });

    } catch (err) {
        console.error("Booking Create Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
// --- GET ALL BOOKINGS (Admin/Agency) ---
const getAllBookings = async (req, res) => {
    try {
        // Optional: Filter by tourId if provided in query ?tourId=...
        const filter = {};
        if (req.query.tourId) filter.tour = req.query.tourId;

        const bookings = await Booking.find(filter)
            .populate('user', 'name email') // Show user details
            .populate('tour', 'title')      // Show tour details
            .sort({ createdAt: -1 });       // Newest first

        res.json({
            results: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- GET SINGLE BOOKING ---
const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('tour')
            .populate('user', 'name email');

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Security: Ensure only the owner or admin can see this
        if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json({ data: booking });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- GET CURRENT USER'S BOOKINGS ---
// Usage: GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('tour', 'title coverImage address price') // Fetch minimal tour info
            .sort({ bookAt: -1 }); // Sort by trip date (descending)

        res.json({
            results: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- CANCEL BOOKING ---
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Check ownership
        if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        // Optional Logic: Don't allow cancellation if trip is today
        const tripDate = new Date(booking.bookAt);
        const today = new Date();
        const diffTime = tripDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1 && req.user.role !== 'admin') {
            return res.status(400).json({ message: "Cannot cancel less than 24 hours before trip" });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: "Booking cancelled successfully", data: booking });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const getCheckoutSession = async (req, res) => {
    try {
        // 1. Get the booking ID from the frontend
        const { bookingId } = req.body;

        // 2. FETCH THE BOOKING (This was likely missing)
        const booking = await Booking.findById(bookingId).populate('tour');

        // Safety check: Did we find it?
        if(!booking) {
            return res.status(404).json({message: "Booking not found"});
        }

        // 3. Define the Client URL (Frontend Address)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'; // Fallback to 3000 if env is missing

        // 4. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/tours/${booking.tour._id}`, // <--- accessing booking here
            customer_email: booking.contactInfo.email,            // <--- accessing booking here
            client_reference_id: bookingId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: booking.totalAmount * 100,   // <--- accessing booking here
                        product_data: {
                            name: booking.tourName,               // <--- accessing booking here
                            description: `Booking for ${booking.guestSize} guests`,
                            // images: [booking.tour.coverImage],
                        },
                    },
                    quantity: 1,
                },
            ],
        });

        // 5. Send URL to Frontend
        res.json({ url: session.url });

    } catch (err) {
        console.error("Stripe Error:", err);
        res.status(500).json({ message: err.message });
    }
};
// 2. VERIFY PAYMENT (The Sandbox Trick)
// This lets you confirm payment on localhost without webhooks
const verifyPayment = async (req, res) => {
    try {
        const { session_id } = req.body;

        // Ask Stripe: "Did this session actually pay?"
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const bookingId = session.client_reference_id;

            // Update Database
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentId: session.payment_intent
            });

            return res.json({ status: 'success', message: 'Payment verified' });
        } else {
            return res.json({ status: 'pending', message: 'Payment not successful' });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
module.exports = {
    createBooking,
    getAllBookings,
    getBooking,
    getMyBookings,
    cancelBooking,
    getCheckoutSession,
    verifyPayment
};