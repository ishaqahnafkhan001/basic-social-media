import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Clock, Calendar, Users, Star, CheckCircle,
    XCircle, User, Award, ArrowLeft, Heart, Share2
} from 'lucide-react';
import Nav from '../components/nav/Nav.jsx'; // Adjust path as needed
import tourApi from '../api/tourApi'; // Adjust path as needed

// Helper to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
    });
};

// Helper to calculate duration
const calculateDuration = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) || 1;
};

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        const fetchTourDetails = async () => {
            try {
                setLoading(true);
                const response = await tourApi.getById(id);

                // Handle response structure based on your API screenshot (res.data.data)
                // Fallback to res.data if structure varies
                const data = response.data.data || response.data;

                setTour(data);
                // Set initial main image
                setActiveImage(data.coverImage || (data.images && data.images[0]));
            } catch (err) {
                console.error("Error fetching tour:", err);
                setError("Could not load tour details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTourDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-semibold text-slate-700">{error || "Tour not found"}</h2>
                <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">
                    Go back to Dashboard
                </button>
            </div>
        );
    }

    // Combine cover image and gallery images for the gallery view
    const allImages = [tour.coverImage, ...(tour.images || [])].filter(Boolean);
    const uniqueImages = [...new Set(allImages)]; // Remove duplicates
    const duration = calculateDuration(tour.startDate, tour.endDate);

    // Determine Agency Name (handle populated object or raw ID)
    const agencyName = tour.agency?.username || tour.agency?.name || "Partner Agency";

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Nav />

            {/* Breadcrumb / Back */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Tours
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Header */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {tour.category}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold text-slate-700">4.8 (120 reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">
                                {tour.title}
                            </h1>
                            <div className="flex items-center gap-2 text-slate-500 text-lg">
                                <MapPin className="w-5 h-5 text-indigo-600" />
                                {tour.destinationCity}, {tour.destinationCountry}
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                            <div className="aspect-video w-full overflow-hidden rounded-xl mb-2 relative">
                                <img
                                    src={activeImage}
                                    alt={tour.title}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="p-2 bg-white/90 rounded-full shadow hover:text-red-500 transition">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-white/90 rounded-full shadow hover:text-indigo-600 transition">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {uniqueImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Clock className="w-6 h-6 text-indigo-600 mb-2" />
                                <span className="text-xs text-slate-500 uppercase font-bold">Duration</span>
                                <span className="font-semibold text-slate-800">{duration} Days</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Users className="w-6 h-6 text-indigo-600 mb-2" />
                                <span className="text-xs text-slate-500 uppercase font-bold">Group Size</span>
                                <span className="font-semibold text-slate-800">Max {tour.maxGroupSize}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                                <span className="text-xs text-slate-500 uppercase font-bold">Start Date</span>
                                <span className="font-semibold text-slate-800">{new Date(tour.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Award className="w-6 h-6 text-indigo-600 mb-2" />
                                <span className="text-xs text-slate-500 uppercase font-bold">Difficulty</span>
                                <span className={`font-semibold ${
                                    tour.difficulty === 'Easy' ? 'text-green-600' :
                                        tour.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                }`}>{tour.difficulty}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">About this Tour</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {tour.description}
                            </p>
                        </div>

                        {/* Itinerary */}
                        {tour.itinerary && tour.itinerary.length > 0 && (
                            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Itinerary</h3>
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {tour.itinerary.map((item, index) => (
                                        <div key={index} className="relative flex items-start group">
                                            <div className="absolute left-0 top-1 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-600 z-10 font-bold text-indigo-700">
                                                {item.day}
                                            </div>
                                            <div className="ml-16 w-full">
                                                <h4 className="text-lg font-bold text-slate-800 mb-1">{item.title}</h4>
                                                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inclusions & Exclusions */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> What's Included
                                </h3>
                                <ul className="space-y-3">
                                    {tour.inclusions && tour.inclusions.map((inc, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                                            {inc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-500" /> Not Included
                                </h3>
                                <ul className="space-y-3">
                                    {tour.exclusions && tour.exclusions.map((exc, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                                            {exc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Price / Book Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <div className="mb-6">
                                    <span className="text-slate-500 text-sm font-medium">Starting from</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-indigo-600">${tour.pricePerPerson}</span>
                                        <span className="text-slate-500">/ person</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Departure</span>
                                        <span className="text-slate-800 font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            {formatDate(tour.startDate)}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Return</span>
                                        <span className="text-slate-800 font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            {formatDate(tour.endDate)}
                                        </span>
                                    </div>
                                </div>

                                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                    Book This Tour
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    Free cancellation up to 48 hours before departure.
                                </p>
                            </div>

                            {/* Agency Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                                    {agencyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-bold uppercase block">Organized by</span>
                                    <span className="text-slate-800 font-bold">{agencyName}</span>
                                </div>
                                <button className="ml-auto p-2 text-slate-400 hover:text-indigo-600 transition">
                                    <User className="w-5 h-5" />
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TourDetail;