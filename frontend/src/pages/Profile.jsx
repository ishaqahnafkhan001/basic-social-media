import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    FiUser, FiMail, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiFacebook,
    FiCheckCircle, FiStar, FiEdit2, FiSave, FiX, FiCamera, FiShield, FiMessageSquare, FiSend
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import userApi from "../api/userApi";
import Nav from "../components/nav/Nav";
import useUser from "../hooks/userInfo.js"; // Use your custom hook

export default function Profile() {
    const { id } = useParams(); // Get ID from URL
    const currentUser = useUser(); // Get currently logged in user

    // Data State
    const [profileUser, setProfileUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Permission State
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Edit Mode State (Owner Only)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Review Form State (Visitor Only)
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverStar, setHoverStar] = useState(0);

    // 1. Load Data & Determine Permissions
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                // Fetch the user details based on URL ID
                const response = await userApi.getById(id);
                const fetchedUser = response.data;
                setProfileUser(fetchedUser);

                // Check permissions: Is the viewer the owner?
                // We compare URL ID vs Token ID
                const isMe = currentUser.id === fetchedUser._id || currentUser.id === id;
                setIsOwnProfile(isMe);

                // If it's me, prepopulate the edit form
                if (isMe) {
                    setFormData({
                        name: fetchedUser.name || "",
                        email: fetchedUser.email || "",
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

                // TODO: Fetch Real Reviews here
                // const reviewsRes = await api.get(`/reviews/${id}`);
                // setReviews(reviewsRes.data);

                // MOCK REVIEWS for visualization
                setReviews([
                    { authorName: "Alice Walker", rating: 5, comment: "Great experience! Very professional." },
                    { authorName: "Bob Smith", rating: 4, comment: "Good, but hard to reach by phone." }
                ]);

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id && currentUser.id) {
            fetchProfileData();
        }
    }, [id, currentUser.id]);

    // --- HANDLERS FOR OWNER ---

    const handleEditChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await userApi.update(profileUser._id, formData);
            setProfileUser(res.data.user); // Update UI with new data
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleRequestVerification = () => {
        // Here you would call an API endpoint to upload ID
        alert("Verification request sent to admin!");
    };

    // --- HANDLERS FOR VISITOR ---

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating!");

        const newReview = {
            authorName: currentUser.userName || "You",
            rating: rating,
            comment: comment
        };

        // TODO: Call API to save review
        // await api.post(`/reviews`, { targetId: id, rating, comment });

        // Optimistic UI Update
        setReviews([newReview, ...reviews]);
        setComment("");
        setRating(0);
        alert("Review submitted!");
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading Profile...</div>;
    if (!profileUser) return <div className="flex h-screen items-center justify-center text-slate-400">User not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav cartCount={0} />

            <div className="max-w-6xl mx-auto px-4 py-12">

                {/* ================= HEADER SECTION ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8"
                >
                    <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                        {/* OWNER ACTION: Edit Button */}
                        {isOwnProfile && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <FiEdit2 /> Edit Profile
                            </button>
                        )}

                        {/* Avatar */}
                        <div className="absolute -bottom-16 left-8 md:left-12">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl relative group">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border border-slate-200 overflow-hidden">
                                    {profileUser.profilePictureUrl ? (
                                        <img src={profileUser.profilePictureUrl} className="w-full h-full object-cover" alt="Avatar"/>
                                    ) : (
                                        profileUser.name[0]
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-10 px-8 md:px-12">
                        {/* Identity & Status */}
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

                                {/* Overall Rating Display */}
                                <div className="flex items-center gap-1 mt-3 text-amber-400 bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
                                    <FiStar fill="currentColor" />
                                    <span className="text-slate-800 font-bold">{profileUser.rating?.average || 0}</span>
                                    <span className="text-slate-400 text-xs font-medium ml-1">({profileUser.rating?.count || 0} reviews)</span>
                                </div>
                            </div>

                            {/* OWNER ACTION: Verification Button */}
                            {isOwnProfile && !profileUser.isVerified && (
                                <button
                                    onClick={handleRequestVerification}
                                    className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2 text-sm"
                                >
                                    <FiShield /> Request Verification
                                </button>
                            )}
                        </div>

                        {/* ================= DETAILS SECTION ================= */}
                        <div className="mt-8">
                            <AnimatePresence mode="wait">
                                {!isEditing ? (
                                    /* --- VIEW MODE --- */
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
                                                {profileUser.email && (
                                                    <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100"><FiMail /></div>
                                                        <span className="truncate">{profileUser.email}</span>
                                                    </div>
                                                )}
                                                {profileUser.phoneNumber && (
                                                    <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100"><FiPhone /></div>
                                                        <span>{profileUser.phoneNumber}</span>
                                                    </div>
                                                )}

                                                <div className="pt-4 flex gap-2 border-t border-slate-200 mt-2">
                                                    {profileUser.socialLinks?.website && <SocialIcon href={profileUser.socialLinks.website} icon={<FiGlobe />} />}
                                                    {profileUser.socialLinks?.instagram && <SocialIcon href={profileUser.socialLinks.instagram} icon={<FiInstagram />} color="text-pink-600" />}
                                                    {profileUser.socialLinks?.facebook && <SocialIcon href={profileUser.socialLinks.facebook} icon={<FiFacebook />} color="text-blue-600" />}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* --- EDIT MODE (Owner Only) --- */
                                    <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <form onSubmit={handleUpdateProfile} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-slate-700">Edit Details</h3>
                                                <button type="button" onClick={() => setIsEditing(false)} className="text-rose-500 font-bold text-sm flex items-center gap-1 hover:bg-rose-50 px-3 py-1 rounded-lg transition-colors"><FiX /> Cancel</button>
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

                    {/* LEFT COLUMN: Review Form */}
                    <div className="lg:col-span-1">
                        {!isOwnProfile ? (
                            // VISITOR: Show Rate Form
                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                                    <FiMessageSquare className="text-indigo-500"/> Rate {profileUser.name}
                                </h3>
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    {/* Star Logic */}
                                    <div className="flex justify-center gap-2 bg-slate-50 p-3 rounded-xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star} type="button"
                                                className={`text-2xl transition-all ${star <= (hoverStar || rating) ? "text-amber-400 scale-110" : "text-slate-300"}`}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverStar(star)}
                                                onMouseLeave={() => setHoverStar(0)}
                                            >
                                                <FiStar fill={star <= (hoverStar || rating) ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={comment} onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience working with this user..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[120px] resize-none"
                                    ></textarea>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                                        <FiSend /> Submit Review
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // OWNER: Show Status Card
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 text-center">
                                <h3 className="font-bold text-indigo-900 mb-2">Your Public Reputation</h3>
                                <p className="text-indigo-700/70 text-sm mb-4">You cannot rate yourself. Here is what others see.</p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-indigo-600 font-bold">
                                    <FiStar fill="currentColor" className="text-amber-400" />
                                    {profileUser.rating?.average || 0} / 5.0
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Review List */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            Reviews <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{reviews.length}</span>
                        </h3>

                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <motion.div
                                        key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 transition-hover hover:shadow-md"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 text-lg">
                                            {review.authorName ? review.authorName[0] : "A"}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{review.authorName || "Anonymous"}</h4>
                                                    <p className="text-xs text-slate-400">Verified Review</p>
                                                </div>
                                                <div className="flex text-amber-400 text-sm bg-amber-50 px-2 py-1 rounded-lg">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar key={i} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-300"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm">{review.comment}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                                    <FiMessageSquare size={28} />
                                </div>
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

// Reusable Components to keep code clean
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