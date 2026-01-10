import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, CreditCard, Clock, AlertCircle, CheckCircle, XCircle, ChevronRight, Users } from 'lucide-react';
import bookingApi from '../api/bookingApi';
import Nav from '../components/nav/Nav';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await bookingApi.getMyBookings();
                setBookings(res.data.data || res.data);
            } catch (err) {
                setError("Failed to load your bookings.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // --- HANDLER: PAY NOW ---
    const handlePayNow = async (bookingId) => {
        try {
            const res = await bookingApi.createCheckoutSession(bookingId);
            if(res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            alert("Payment service unavailable.");
        }
    };

    // --- HANDLER: CANCEL BOOKING ---
    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking? Refunds may take 5-7 days.")) return;

        try {
            await bookingApi.cancel(bookingId);
            setBookings(prev => prev.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
        } catch (err) {
            alert(err.response?.data?.message || "Could not cancel booking");
        }
    };

    // --- HELPERS: STATUS BADGES ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3"/> <span className="hidden sm:inline">Confirmed</span><span className="sm:hidden">OK</span></span>;
            case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0"><Clock className="w-3 h-3"/> Pending</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0"><XCircle className="w-3 h-3"/> Cancelled</span>;
            default: return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold shrink-0">{status}</span>;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading your trips...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Nav />

            <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">My Bookings</h1>
                <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8">Manage your upcoming trips and payments.</p>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

                {/* EMPTY STATE */}
                {!loading && bookings.length === 0 && (
                    <div className="text-center py-12 md:py-20 bg-white rounded-3xl shadow-sm border border-slate-100 mx-auto max-w-lg">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No trips booked yet</h3>
                        <p className="text-slate-500 mb-6 px-4">Time to start your next adventure!</p>
                        <Link to="/tours" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition inline-block">
                            Explore Tours
                        </Link>
                    </div>
                )}

                {/* BOOKING LIST */}
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">

                            {/* Image Section */}
                            {/* Mobile: Full Width / Desktop: Fixed Width */}
                            <div className="w-full h-48 md:w-56 md:h-auto shrink-0 relative bg-slate-200">
                                <img
                                    src={booking.tour?.coverImage || "https://placehold.co/400x300?text=Tour"}
                                    alt={booking.tourName}
                                    className="w-full h-full object-cover"
                                />
                                {/* Mobile-only status badge overlay for better space usage */}
                                <div className="absolute top-3 right-3 md:hidden">
                                    {getStatusBadge(booking.status)}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6">

                                {/* Info Column */}
                                <div className="flex-1 space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-slate-800 line-clamp-2 leading-tight">
                                                {booking.tourName}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">ID: #{booking._id.slice(-6)}</p>
                                        </div>
                                        {/* Desktop-only status badge */}
                                        <div className="hidden md:block">
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 md:gap-6 text-sm text-slate-600">
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg sm:bg-transparent sm:p-0">
                                            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <span className="truncate">{new Date(booking.bookAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg sm:bg-transparent sm:p-0">
                                            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <span>{booking.guestSize} Guests</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg sm:bg-transparent sm:p-0 col-span-2 sm:col-span-1">
                                            <CreditCard className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <span className="font-semibold">${booking.totalAmount}</span>
                                        </div>
                                    </div>

                                    {/* Payment Status Indicator */}
                                    <div className="pt-1">
                                        <span className={`inline-block text-xs font-bold px-2 py-1 rounded border ${
                                            booking.paymentStatus === 'paid'
                                                ? 'border-green-200 text-green-600 bg-green-50'
                                                : 'border-orange-200 text-orange-600 bg-orange-50'
                                        }`}>
                                            Payment: {booking.paymentStatus.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions Column */}
                                {/* Mobile: Top Border / Desktop: Left Border */}
                                <div className="border-t border-slate-100 pt-4 mt-2 md:border-t-0 md:pt-0 md:mt-0 md:border-l md:pl-6 md:w-48 flex flex-col justify-center gap-3">

                                    {/* Pay Now Button */}
                                    {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
                                        <button
                                            onClick={() => handlePayNow(booking._id)}
                                            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                        >
                                            Pay Now <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* View Tour Button */}
                                    <Link
                                        to={`/tours/${booking.tour?._id}`}
                                        className="w-full py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition text-center"
                                    >
                                        View Tour
                                    </Link>

                                    {/* Cancel Button */}
                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            className="w-full py-2 text-red-400 text-xs font-bold hover:text-red-600 transition underline decoration-dashed underline-offset-4"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;