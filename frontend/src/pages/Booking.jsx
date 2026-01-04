import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Info, ArrowLeft, Star, UserPlus, Trash2, Users } from 'lucide-react';
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

    // --- NEW: Partner/Guest State ---
    const [partners, setPartners] = useState([]);

    // Form State (Main User)
    const [bookingData, setBookingData] = useState({
        fullName: user?.name || '',
        phone: user?.phoneNumber || '',
        bookAt: ''
    });

    // Load Tour Data
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await tourApi.getById(id);
                setTour(res.data.data || res.data);

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

    // --- NEW: Calculation Logic ---
    // Total guests = 1 (Main User) + Number of Partners
    const totalGuests = 1 + partners.length;

    const price = tour?.pricePerPerson || 0;
    const serviceFee = 10;
    const totalAmount = (price * totalGuests) + serviceFee;

    // --- NEW: Partner Handlers ---
    const addPartner = () => {
        // Prevent adding more than max group size
        if (tour && totalGuests >= tour.maxGroupSize) {
            return alert(`Maximum group size is ${tour.maxGroupSize}`);
        }
        setPartners([...partners, { fullName: '', phone: '', age: '' }]);
    };

    const removePartner = (index) => {
        const updatedPartners = partners.filter((_, i) => i !== index);
        setPartners(updatedPartners);
    };

    const handlePartnerChange = (index, field, value) => {
        const updatedPartners = [...partners];
        updatedPartners[index][field] = value;
        setPartners(updatedPartners);
    };

    // Main User Handlers
    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) return alert("Please sign in to book.");
        if (!bookingData.bookAt || !bookingData.fullName || !bookingData.phone) {
            return alert("Please fill in all required fields for yourself.");
        }

        // Validate partners
        for (let p of partners) {
            if (!p.fullName) return alert("Please fill in names for all added guests.");
        }

        setIsProcessing(true);

        try {
            const payload = {
                userId: user.id || user._id,
                userEmail: user.email,
                tourName: tour.title,
                tourId: tour._id,

                // Main User Details
                fullName: bookingData.fullName,
                phone: bookingData.phone,
                bookAt: bookingData.bookAt,

                // Calculated Totals
                guestSize: totalGuests,
                totalAmount: totalAmount,

                // Send partner details (Ensure your backend schema can accept this array, or simply ignore it)
                guestDetails: partners
            };

            await bookingApi.create(payload);

            alert("Booking Successful! Redirecting...");
            // navigate('/dashboard');

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

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Main User Section */}
                            <div className="space-y-5 border-b border-slate-100 pb-6">
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Primary Contact</h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                        <input
                                            type="text" id="fullName"
                                            value={bookingData.fullName} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                            placeholder="Your Name" required
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
                                <div>
                                    <label htmlFor="bookAt" className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
                                    <input
                                        type="date" id="bookAt"
                                        value={bookingData.bookAt} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* --- NEW SECTION: Partners / Guests --- */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Additional Guests</h3>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                        Total Guests: {totalGuests}
                                    </span>
                                </div>

                                {partners.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No additional guests added.</p>
                                )}

                                {partners.map((partner, index) => (
                                    <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative animate-fadeIn">
                                        <div className="absolute top-2 right-2">
                                            <button
                                                type="button"
                                                onClick={() => removePartner(index)}
                                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                                title="Remove guest"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-1">Guest Name</label>
                                                <input
                                                    type="text"
                                                    value={partner.fullName}
                                                    onChange={(e) => handlePartnerChange(index, 'fullName', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white text-sm"
                                                    placeholder="Guest Full Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-1">Age (Optional)</label>
                                                <input
                                                    type="number"
                                                    value={partner.age}
                                                    onChange={(e) => handlePartnerChange(index, 'age', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white text-sm"
                                                    placeholder="Age"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addPartner}
                                    className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" /> Add Friend or Family
                                </button>
                            </div>

                            {/* Payment Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-indigo-600"/> Payment Details
                                </h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500 flex items-start gap-3">
                                    <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <p>This is a demo. No actual payment will be processed.</p>
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
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Total Guests</span>
                                <span className="font-bold text-indigo-600">{totalGuests} Person(s)</span>
                            </div>

                            <div className="flex justify-between mt-4">
                                <span>${price} x {totalGuests} person</span>
                                <span>${price * totalGuests}</span>
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
                            {isProcessing ? "Processing..." : `Pay $${totalAmount} & Book`}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Booking;