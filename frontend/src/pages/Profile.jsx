import React, { useState, useEffect } from "react";
import { useParams, useNavigate,Link } from "react-router-dom";
import {
    FiUser, FiMail, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiFacebook,
    FiCheckCircle, FiStar, FiEdit2, FiSave, FiX, FiShield, FiMessageSquare, FiSend,
    FiLogOut, FiCamera
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast'; // Import Toast

import userApi from "../api/userApi";
import reviewApi from "../api/reviewApi";
import Nav from "../components/nav/Nav";
import useUser from "../hooks/userInfo.js";

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useUser();

    // Data State
    const [profileUser, setProfileUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Permission State
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Edit Mode & Form State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Image Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Review Form State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverStar, setHoverStar] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);

    // 1. Load Data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                // A. Fetch User Details
                const response = await userApi.getById(id);
                const fetchedUser = response.data;
                setProfileUser(fetchedUser);

                // Check permissions
                const isMe = currentUser.id === fetchedUser._id || currentUser.id === id;
                setIsOwnProfile(isMe);

                // Prepopulate edit form
                if (isMe) {
                    setFormData({
                        name: fetchedUser.name || "",
                        email: fetchedUser.email || "", // Email usually read-only, but kept for reference
                        phoneNumber: fetchedUser.phoneNumber || "",
                        description: fetchedUser.description || "",
                        address: {
                            city: fetchedUser.address?.city || "",
                            country: fetchedUser.address?.country || ""
                        },
                        socialLinks: {
                            facebook: fetchedUser.socialLinks?.facebook || "",
                            instagram: fetchedUser.socialLinks?.instagram || "",
                            website: fetchedUser.socialLinks?.website || ""
                        }
                    });
                }

                // B. Fetch Reviews
                try {
                    const reviewsRes = await reviewApi.getAllByUser(id);
                    setReviews(reviewsRes.data.data || reviewsRes.data || []);
                } catch (reviewErr) {
                    setReviews([]);
                }

            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("Could not load profile data");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfileData();
    }, [id, currentUser.id]);

    // --- HANDLERS ---

    const handleEditChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            toast.success("Logged out successfully");
            setTimeout(() => {
                navigate("/auth");
                window.location.reload();
            }, 1000);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        const loadingToast = toast.loading("Updating profile...");
        setSaving(true);

        try {
            // Prepare FormData for file upload
            const data = new FormData();
            data.append("name", formData.name);
            data.append("phoneNumber", formData.phoneNumber);
            data.append("description", formData.description);

            // Nested objects must be stringified for FormData
            data.append("address", JSON.stringify(formData.address));
            data.append("socialLinks", JSON.stringify(formData.socialLinks));

            if (selectedFile) {
                data.append("profilePicture", selectedFile);
            }

            const res = await userApi.update(profileUser._id, data);

            setProfileUser(res.data.user || res.data);
            setIsEditing(false);
            setSelectedFile(null); // Clear file input

            toast.dismiss(loadingToast);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!currentUser.isLoggedIn) return toast.error("You must be logged in to review.");
        if (rating === 0) return toast.error("Please select a star rating!");
        if (!comment.trim()) return toast.error("Please write a comment!");

        const loadingToast = toast.loading("Submitting review...");
        setSubmittingReview(true);

        try {
            const payload = { rating: rating, review: comment };
            const res = await reviewApi.createForUser(id, payload);

            const newReview = res.data.data || {
                _id: Date.now(),
                rating,
                review: comment,
                user: {
                    name: currentUser.userName || "You",
                    profilePictureUrl: currentUser.user?.profilePictureUrl
                },
                createdAt: new Date().toISOString()
            };

            setReviews([newReview, ...reviews]);

            // Update UI stats locally
            setProfileUser(prev => {
                const currentAvg = prev.ratingsAverage || 0;
                const currentCount = prev.ratingsQuantity || 0;
                const newCount = currentCount + 1;
                const newAvg = ((currentAvg * currentCount) + rating) / newCount;

                return {
                    ...prev,
                    ratingsQuantity: newCount,
                    ratingsAverage: Math.round(newAvg * 10) / 10
                };
            });

            setComment("");
            setRating(0);

            toast.dismiss(loadingToast);
            toast.success("Review submitted successfully!");

        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleRequestVerification = () => {
        toast.success("Verification request sent to admin!");
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading Profile...</div>;
    if (!profileUser) return <div className="flex h-screen items-center justify-center text-slate-400">User not found</div>;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav />
            {/* TOASTER COMPONENT */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="max-w-6xl mx-auto px-4 py-12">

                {/* ================= HEADER SECTION ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8"
                >
                    <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                        {isOwnProfile && (
                            <div className="absolute top-6 right-6 flex gap-3">
                                {/* LOGOUT */}
                                <button
                                    onClick={handleLogout}
                                    className="bg-rose-500/20 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg border border-white/20"
                                >
                                    <FiLogOut /> Logout
                                </button>

                                {/* EDIT TOGGLE */}
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg border border-white/20"
                                    >
                                        <FiEdit2 /> Edit Profile
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="absolute -bottom-16 left-8 md:left-12">
                            {/* AVATAR + UPLOAD OVERLAY */}
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl relative group">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border border-slate-200 overflow-hidden relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview"/>
                                    ) : profileUser.profilePictureUrl ? (
                                        <img src={profileUser.profilePictureUrl} className="w-full h-full object-cover" alt="Avatar"/>
                                    ) : (
                                        profileUser.name ? profileUser.name[0].toUpperCase() : "U"
                                    )}

                                    {isEditing && (
                                        <label htmlFor="profile-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiCamera className="text-white text-3xl drop-shadow-md" />
                                            <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-10 px-8 md:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                                    {profileUser.name}
                                    {profileUser.isVerified ? (
                                        <div title="Verified" className="text-blue-500"><FiCheckCircle size={24} fill="currentColor" className="text-white bg-blue-500 rounded-full" /></div>
                                    ) : (
                                        isOwnProfile && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded border border-slate-200">Unverified</span>
                                    )}
                                </h1>
                                <p className="text-indigo-600 font-bold text-sm uppercase mt-1 tracking-wide">{profileUser.role}</p>

                                <div className="flex items-center gap-1 mt-3 text-amber-400 bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
                                    <FiStar fill="currentColor" />
                                    <span className="text-slate-800 font-bold">{profileUser.ratingsAverage || 0}</span>
                                    <span className="text-slate-400 text-xs font-medium ml-1">({profileUser.ratingsQuantity || 0} reviews)</span>
                                </div>
                            </div>

                            {isOwnProfile && !profileUser.isVerified && (
                                <Link
                                    to="/request"
                                    className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2 text-sm"
                                >
                                    <FiShield /> Request Verification
                                </Link>
                            )}
                        </div>

                        {/* CONTENT AREA */}
                        <div className="mt-8">
                            <AnimatePresence mode="wait">
                                {!isEditing ? (
                                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-2">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h3>
                                            <p className="text-slate-600 leading-relaxed text-lg">
                                                {profileUser.description || <span className="italic text-slate-400">No bio added yet.</span>}
                                            </p>
                                            <div className="flex flex-wrap gap-3 mt-6">
                                                {profileUser.address?.city && (
                                                    <span className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-100">
                                                        <FiMapPin className="text-indigo-500"/> {profileUser.address.city}, {profileUser.address.country}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact & Socials</h3>
                                            <div className="space-y-4">
                                                {profileUser.email && <div className="flex items-center gap-3 text-slate-700 text-sm font-medium"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100"><FiMail /></div><span className="truncate">{profileUser.email}</span></div>}
                                                {profileUser.phoneNumber && <div className="flex items-center gap-3 text-slate-700 text-sm font-medium"><div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100"><FiPhone /></div><span>{profileUser.phoneNumber}</span></div>}
                                                <div className="pt-4 flex gap-2 border-t border-slate-200 mt-2">
                                                    {profileUser.socialLinks?.website && <SocialIcon href={profileUser.socialLinks.website} icon={<FiGlobe />} />}
                                                    {profileUser.socialLinks?.instagram && <SocialIcon href={profileUser.socialLinks.instagram} icon={<FiInstagram />} color="text-pink-600" />}
                                                    {profileUser.socialLinks?.facebook && <SocialIcon href={profileUser.socialLinks.facebook} icon={<FiFacebook />} color="text-blue-600" />}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <form onSubmit={handleUpdateProfile} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-slate-700">Edit Details</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsEditing(false); setPreviewUrl(null); setSelectedFile(null); }}
                                                    className="text-rose-500 font-bold text-sm flex items-center gap-1 hover:bg-rose-50 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    <FiX /> Cancel
                                                </button>
                                            </div>

                                            <div className="mb-4 text-center p-3 bg-indigo-50 rounded-xl text-indigo-700 text-sm">
                                                Tip: Click the camera icon on your profile picture above to change it!
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <InputField label="Full Name" name="name" value={formData.name} onChange={handleEditChange} icon={<FiUser />} />
                                                    <InputField label="Phone" name="phoneNumber" value={formData.phoneNumber} onChange={handleEditChange} icon={<FiPhone />} />
                                                    <InputField label="City" value={formData.address.city} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} icon={<FiMapPin />} />
                                                </div>
                                                <div className="space-y-4">
                                                    <InputField label="Website" value={formData.socialLinks.website} onChange={(e) => handleNestedChange('socialLinks', 'website', e.target.value)} icon={<FiGlobe />} />
                                                    <InputField label="Instagram" value={formData.socialLinks.instagram} onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)} icon={<FiInstagram />} />
                                                    <InputField label="Country" value={formData.address.country} onChange={(e) => handleNestedChange('address', 'country', e.target.value)} icon={<FiGlobe />} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio</label>
                                                    <textarea name="description" value={formData.description} onChange={handleEditChange} className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" />
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                                                <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                                                    {saving ? "Saving..." : <><FiSave /> Save Changes</>}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* ================= REVIEWS SECTION ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Review Form */}
                    <div className="lg:col-span-1">
                        {!isOwnProfile ? (
                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                                    <FiMessageSquare className="text-indigo-500"/> Rate {profileUser.name}
                                </h3>
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="flex justify-center gap-2 bg-slate-50 p-3 rounded-xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} type="button" className={`text-2xl transition-all ${star <= (hoverStar || rating) ? "text-amber-400 scale-110" : "text-slate-300"}`} onClick={() => setRating(star)} onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)}>
                                                <FiStar fill={star <= (hoverStar || rating) ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience working with this user..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[120px] resize-none"></textarea>
                                    <button type="submit" disabled={submittingReview} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                        {submittingReview ? "Submitting..." : <><FiSend /> Submit Review</>}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 text-center">
                                <h3 className="font-bold text-indigo-900 mb-2">Your Public Reputation</h3>
                                <p className="text-indigo-700/70 text-sm mb-4">You cannot rate yourself. Here is what others see.</p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-indigo-600 font-bold">
                                    <FiStar fill="currentColor" className="text-amber-400" />
                                    {profileUser.ratingsAverage || 0} / 5.0
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Review List */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">Reviews <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{reviews.length}</span></h3>
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <motion.div key={review._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 transition-hover hover:shadow-md">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 text-lg overflow-hidden">
                                            {review.user?.profilePictureUrl ? (<img src={review.user.profilePictureUrl} alt="User" className="w-full h-full object-cover" />) : (review.user?.name ? review.user.name[0].toUpperCase() : "A")}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div><h4 className="font-bold text-slate-800">{review.user?.name || "Anonymous"}</h4><div className="flex items-center gap-2"><p className="text-xs text-slate-400">{formatDate(review.createdAt)}</p></div></div>
                                                <div className="flex text-amber-400 text-sm bg-amber-50 px-2 py-1 rounded-lg">{[...Array(5)].map((_, i) => (<FiStar key={i} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-300"} />))}</div>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm">{review.review || review.comment}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4"><FiMessageSquare size={28} /></div>
                                <h4 className="text-slate-500 font-bold mb-1">No reviews yet</h4>
                                <p className="text-slate-400 text-sm">Be the first to share your experience!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
const InputField = ({ label, icon, name, value, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400">{icon}</span>
            <input
                type="text" name={name} value={value} onChange={onChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            />
        </div>
    </div>
);

const SocialIcon = ({ href, icon, color = "text-slate-500" }) => (
    <a href={href} target="_blank" rel="noreferrer" className={`p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:scale-105 transition-all shadow-sm ${color}`}>
        {icon}
    </a>
);