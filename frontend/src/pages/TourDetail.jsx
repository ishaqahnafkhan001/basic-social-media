import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Clock, Calendar, Users, Star, CheckCircle,
    XCircle, User, Award, ArrowLeft, Heart, Share2, MessageSquare, Send, ThumbsUp
} from 'lucide-react';
import Nav from '../components/nav/Nav.jsx';
import tourApi from '../api/tourApi';
import reviewApi from '../api/reviewApi'; // IMPORTS REVIEW API
import useUser from '../hooks/userInfo.js';   // IMPORTS USER HOOK

// Helper Functions
const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

const calculateDuration = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) || 1;
};

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useUser(); // Get current user info

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);

    // --- REAL REVIEW STATE ---
    const [tourReviews, setTourReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTourDetails = async () => {
            try {
                setLoading(true);
                const response = await tourApi.getById(id);
                // Ensure we handle the response structure correctly
                const data = response.data.data || response.data;

                setTour(data);

                // Set Reviews from the Virtual Populate field (data.reviews)
                // If your backend getById populates 'reviews', they will be here.
                setTourReviews(data.reviews || []);

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

    // --- REAL SUBMIT HANDLER ---
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        // 1. Validation
        if (!isLoggedIn) return alert("You must be logged in to leave a review.");
        if (userRating === 0) return alert("Please click a star to rate.");
        if (!userComment.trim()) return alert("Please write a short review.");

        setIsSubmitting(true);

        try {
            // 2. Call Backend
            const payload = {
                rating: userRating,
                review: userComment,
                tour: id
            };
            console.log(payload)

            // We expect the backend to return the created review
            const res = await reviewApi.create(id, payload);
            console.log(res)
            // 3. Optimistic UI Update
            // We construct a review object that looks like the populated one
            // so it displays immediately without refreshing.
            const newReview = {
                _id: res.data.data?._id || Date.now(), // Use backend ID or fallback
                user: {
                    _id: user.id || user._id,
                    name: user.name || "You",
                    profilePictureUrl: user.profilePictureUrl
                },
                rating: userRating,
                review: userComment,
                createdAt: new Date().toISOString()
            };

            // Add to top of list
            setTourReviews([newReview, ...tourReviews]);

            // 4. Reset Form
            setUserRating(0);
            setUserComment("");
            alert("Review submitted successfully!");

        } catch (err) {
            console.error("Review failed", err);
            // Handle duplicate review error specifically
            if (err.response && err.response.status === 409) {
                alert("You have already reviewed this tour.");
            } else {
                alert("Failed to submit review. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (error || !tour) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4"><h2 className="text-xl font-semibold text-slate-700">{error || "Tour not found"}</h2><button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Go back to Dashboard</button></div>;

    const allImages = [tour.coverImage, ...(tour.images || [])].filter(Boolean);
    const uniqueImages = [...new Set(allImages)];
    const duration = calculateDuration(tour.startDate, tour.endDate);

    // Safely handle Agency Data
    const agencyName = tour.agency?.name || "Partner Agency";
    const agencyId = tour.agency?._id || tour.agency?.id;

    // Calculate rating for display (use backend aggregates if available)
    const displayRating = tour.ratingsAverage || 0;
    const displayCount = tour.ratingsQuantity || tourReviews.length;
// This creates a simple array of strings: ["John Doe", "Alice Smith", "Bob"]
    const namesOnly = tourReviews.map(review => review.user || "Anonymous");
    console.log(tourReviews)

    // console.log(namesOnly.useUser().initials.);
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Nav />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition">
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
                                    <span className="text-sm font-bold text-slate-700">{displayRating} ({displayCount} reviews)</span>
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

                        {/* Gallery */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                            <div className="aspect-video w-full overflow-hidden rounded-xl mb-2 relative">
                                <img
                                    src={activeImage}
                                    alt={tour.title}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
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

                        {/* Stats */}
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

                        {/* Inclusions */}
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

                        {/* ========================================================= */}
                        {/* REVIEW SYSTEM (CONNECTED TO BACKEND)                      */}
                        {/* ========================================================= */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100" id="reviews-section">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6 text-indigo-600" /> Reviews ({tourReviews.length})
                                </h3>
                            </div>

                            {/* 1. Review Form (Only if logged in) */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                                <h4 className="text-lg font-bold text-slate-800 mb-3">Leave a Review</h4>

                                {!isLoggedIn ? (
                                    <div className="text-center py-4">
                                        <p className="text-slate-500 mb-2">Please log in to share your experience.</p>
                                        <Link to="/auth" className="text-indigo-600 font-bold hover:underline">Log In Here</Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-sm font-semibold text-slate-500">Your Rating:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="transition-transform hover:scale-110 focus:outline-none"
                                                        onClick={() => setUserRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                    >
                                                        <Star
                                                            className={`w-7 h-7 transition-colors duration-200 ${
                                                                star <= (hoverRating || userRating)
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "fill-transparent text-slate-300"
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            placeholder="Share details of your experience..."
                                            className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[120px] mb-4 text-slate-700 bg-white"
                                        ></textarea>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                                        >
                                            {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4" /> Post Review</>}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* 2. Reviews List */}
                            <div className="space-y-6">
                                {tourReviews.length > 0 ? (
                                    tourReviews.map((review) => (
                                        <div key={review._id || review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-start gap-4">
                                                {/* Avatar Circle */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 border border-white shadow-sm overflow-hidden">
                                                    {review.user?.profilePictureUrl ? (
                                                        <img src={review.user.profilePictureUrl} alt="User" className="w-full h-full object-cover" />
                                                    ) : (
                                                        review.user?.name?.charAt(0) || "U"
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-slate-800 text-base">{review.user?.name || "Anonymous User"}</h5>
                                                            <span className="text-xs text-slate-400 font-medium">{formatDate(review.createdAt)}</span>
                                                        </div>
                                                        <div className="flex bg-yellow-50 px-2 py-1 rounded-md">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3.5 h-3.5 ${
                                                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 mt-2 leading-relaxed text-sm">
                                                        {review.review || review.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        No reviews yet. Be the first to review!
                                    </div>
                                )}
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
                                        <span className="text-slate-800 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" />{formatDate(tour.startDate)}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Return</span>
                                        <span className="text-slate-800 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" />{formatDate(tour.endDate)}</span>
                                    </div>
                                </div>
                                <Link to={`/tours/${tour._id}/book`} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                    Book This Tour
                                </Link>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    Free cancellation up to 48 hours before departure.
                                </p>
                            </div>

                            {/* Agency Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                                        {agencyName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs text-slate-400 font-bold uppercase block">Organized by</span>
                                        <h4 className="text-slate-800 font-bold text-lg leading-tight">{agencyName}</h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-slate-700">{displayRating}</span>
                                        </div>
                                    </div>
                                    <Link to={`/profile/${agencyId}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                                        <User className="w-5 h-5" />
                                    </Link>
                                </div>
                                <div className="h-px bg-slate-100 mx-6"></div>
                                <div className="p-6 bg-slate-50/50">
                                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Recent Agency Reviews
                                    </h5>

                                    {/* Sidebar Reviews - Just taking the first 2 from the current list */}
                                    <div className="space-y-4">
                                        {tourReviews.length > 0 ? tourReviews.slice(0, 2).map((review) => (
                                            <div key={review._id || review.id} className="flex gap-3 items-start">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                                                    {review.user?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">"{review.review || review.text}"</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-xs text-slate-400 italic">No reviews yet.</p>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TourDetail;