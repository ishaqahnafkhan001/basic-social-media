import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, CreditCard, CheckCircle, Info, ArrowLeft, Star } from 'lucide-react';
import Nav from '../components/nav/Nav';
import tourApi from '../api/tourApi';
import bookingApi from '../api/bookingApi';
import useUser from '../hooks/userInfo.js';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useUser();

    // Data State
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [bookingData, setBookingData] = useState({
        fullName: user?.name || '',
        phone: user?.phoneNumber || '',
        guestSize: 1,
        bookAt: ''
    });

    // Load Tour Data
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await tourApi.getById(id);
                setTour(res.data.data || res.data);

                // Set default booking date to tour start date
                if(res.data.data?.startDate) {
                    setBookingData(prev => ({...prev, bookAt: res.data.data.startDate.split('T')[0]}));
                }
            } catch (err) {
                console.error("Failed to load tour");
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    // Calculations
    const price = tour?.pricePerPerson || 0;
    const serviceFee = 10; // Fixed service fee for example
    const totalAmount = (price * Number(bookingData.guestSize)) + serviceFee;

    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) return alert("Please sign in to book.");
        if (!bookingData.bookAt || !bookingData.fullName || !bookingData.phone) {
            return alert("Please fill in all required fields");
        }

        setIsProcessing(true);

        try {
            const payload = {
                userId: user.id || user._id,
                userEmail: user.email,
                tourName: tour.title,
                tourId: tour._id, // or tour.id
                fullName: bookingData.fullName,
                guestSize: Number(bookingData.guestSize),
                phone: bookingData.phone,
                bookAt: bookingData.bookAt,
                totalAmount: totalAmount
            };

            await bookingApi.create(payload);

            alert("Booking Successful! Redirecting to dashboard...");
            navigate('/thank-you'); // Create this page later or go to /dashboard

        } catch (err) {
            alert(err.response?.data?.message || "Booking failed");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!tour) return <div className="min-h-screen flex items-center justify-center">Tour not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Nav />

            {/* Back Button */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN: Booking Form --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Booking Information</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text" id="fullName"
                                        value={bookingData.fullName} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        placeholder="John Doe" required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel" id="phone"
                                        value={bookingData.phone} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        placeholder="+1 234 567 890" required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="bookAt" className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
                                    <input
                                        type="date" id="bookAt"
                                        value={bookingData.bookAt} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="guestSize" className="block text-sm font-bold text-slate-700 mb-1.5">Guests</label>
                                    <input
                                        type="number" id="guestSize"
                                        value={bookingData.guestSize} onChange={handleChange}
                                        min="1" max={tour.maxGroupSize}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fake Payment Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-indigo-600"/> Payment Details
                                </h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500 flex items-start gap-3">
                                    <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <p>This is a demo. No actual payment will be processed, but your booking will be saved to the database.</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Order Summary --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-24">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h3>

                        {/* Tour Mini Card */}
                        <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                <img src={tour.coverImage} alt={tour.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 line-clamp-2 text-sm mb-1">{tour.title}</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                    <MapPin className="w-3 h-3" /> {tour.destinationCity}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                                    <Star className="w-3 h-3 fill-current" /> {tour.ratingsAverage} ({tour.ratingsQuantity})
                                </div>
                            </div>
                        </div>

                        {/* Calculations */}
                        <div className="space-y-3 text-sm text-slate-600 mb-6">
                            <div className="flex justify-between">
                                <span>${price} x {bookingData.guestSize} person</span>
                                <span>${price * bookingData.guestSize}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Service charge</span>
                                <span>${serviceFee}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-100 mt-3">
                                <span>Total</span>
                                <span>${totalAmount}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Pay Now & Book"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Booking;