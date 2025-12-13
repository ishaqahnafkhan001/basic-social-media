import React, { useState, useEffect } from "react";
import {
    FiUser, FiMail, FiShield, FiLogOut, FiEdit2, FiSave, FiX,
    FiCamera, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiFacebook, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import userApi from "../api/userApi"; // UPDATED IMPORT
import Nav from "../components/nav/Nav";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Complex Form State to match Mongoose Schema
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        description: "",
        address: { city: "", country: "" },
        socialLinks: { facebook: "", instagram: "", website: "" }
    });

    // 1. Load Fresh User Data from API
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // We use getMe() to get full details including nested objects
                const response = await userApi.getMe();
                const userData = response.data; // Adjust based on your axios response structure

                setUser(userData);

                // Initialize form with existing data or defaults
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phoneNumber: userData.phoneNumber || "",
                    description: userData.description || "",
                    address: {
                        city: userData.address?.city || "",
                        country: userData.address?.country || ""
                    },
                    socialLinks: {
                        facebook: userData.socialLinks?.facebook || "",
                        instagram: userData.socialLinks?.instagram || "",
                        website: userData.socialLinks?.website || ""
                    }
                });
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth"; // Or use router navigation
    };

    // Handle Top Level Inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Nested Inputs (Address / Social)
    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    // 2. Handle Update Logic
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // API Call
            const res = await userApi.update(user._id, formData);
            const updatedUser = res.data.user;

            setUser(updatedUser); // Update UI
            setIsEditing(false);

            // Optional: Update LocalStorage if you use it for session persistence
            // localStorage.setItem("user", JSON.stringify(updatedUser));

            // alert("Profile Updated Successfully");
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading Profile...</div>;

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        : "U";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav cartCount={0} userRole={user?.role} user={user?.name} />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
                >
                    {/* --- Header / Banner --- */}
                    <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                        {/* Edit Button Toggle */}
                        <div className="absolute top-6 right-6 z-10">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/30 transition-all shadow-lg"
                                >
                                    <FiEdit2 /> Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 bg-rose-500/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-rose-600 transition-all shadow-lg"
                                >
                                    <FiX /> Cancel
                                </button>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="absolute -bottom-16 left-8 md:left-12">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl relative group">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border border-slate-200 overflow-hidden">
                                    {user.profilePictureUrl ? (
                                        <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <FiCamera size={28} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- Content Section --- */}
                    <div className="pt-20 pb-10 px-8 md:px-12">

                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                /* ================= VIEW MODE ================= */
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Identity Block */}
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                                            {/* Verification Badge */}
                                            {user.isVerified ? (
                                                <div title="Verified User" className="text-blue-500"><FiCheckCircle size={24} fill="currentColor" className="text-white bg-blue-500 rounded-full" /></div>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded border border-slate-200">Unverified</span>
                                            )}
                                        </div>

                                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                            {user.email}
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="capitalize text-indigo-600 font-bold text-sm">{user.role}</span>
                                        </p>

                                        {/* Bio / Description */}
                                        {user.description && (
                                            <p className="mt-4 text-slate-600 leading-relaxed max-w-2xl">
                                                {user.description}
                                            </p>
                                        )}

                                        {/* Location & Contact */}
                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {(user.address?.city || user.address?.country) && (
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <FiMapPin className="text-indigo-500" />
                                                    {user.address?.city}, {user.address?.country}
                                                </div>
                                            )}
                                            {user.phoneNumber && (
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <FiPhone className="text-indigo-500" />
                                                    {user.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-slate-100" />

                                    {/* Socials & Extras */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Connect</h3>
                                            <div className="flex gap-3">
                                                {user.socialLinks?.website && (
                                                    <a href={user.socialLinks.website} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-xl transition-colors border border-slate-100"><FiGlobe size={20}/></a>
                                                )}
                                                {user.socialLinks?.instagram && (
                                                    <a href={user.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 hover:bg-pink-50 hover:text-pink-600 text-slate-400 rounded-xl transition-colors border border-slate-100"><FiInstagram size={20}/></a>
                                                )}
                                                {user.socialLinks?.facebook && (
                                                    <a href={user.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-xl transition-colors border border-slate-100"><FiFacebook size={20}/></a>
                                                )}
                                                {(!user.socialLinks?.website && !user.socialLinks?.instagram && !user.socialLinks?.facebook) && (
                                                    <p className="text-sm text-slate-400 italic">No social links added.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Account Status</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
                                                    <FiShield /> Active
                                                </div>
                                                {/* Verification Button Concept */}
                                                {!user.isVerified && (
                                                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 transition-colors">
                                                        Request Verification
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                /* ================= EDIT MODE ================= */
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* --- Personal Details --- */}
                                        <div className="md:col-span-2">
                                            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Personal Details</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <InputField label="Full Name" icon={<FiUser />} name="name" value={formData.name} onChange={handleChange} />
                                            <InputField label="Email Address" icon={<FiMail />} name="email" value={formData.email} onChange={handleChange} />
                                            <InputField label="Phone Number" icon={<FiPhone />} name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+880..." />
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Bio / Description</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm h-[138px] resize-none"
                                                    placeholder="Tell people about yourself..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* --- Location --- */}
                                        <div className="md:col-span-2 mt-2">
                                            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Location</h3>
                                        </div>

                                        <InputField
                                            label="City" icon={<FiMapPin />}
                                            value={formData.address.city}
                                            onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                                        />
                                        <InputField
                                            label="Country" icon={<FiGlobe />}
                                            value={formData.address.country}
                                            onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                                        />

                                        {/* --- Social Links --- */}
                                        <div className="md:col-span-2 mt-2">
                                            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Social Links</h3>
                                        </div>

                                        <InputField
                                            label="Website URL" icon={<FiGlobe />}
                                            value={formData.socialLinks.website}
                                            onChange={(e) => handleNestedChange('socialLinks', 'website', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <InputField
                                            label="Instagram URL" icon={<FiInstagram />}
                                            value={formData.socialLinks.instagram}
                                            onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                                            placeholder="https://instagram.com/..."
                                        />
                                        <div className="md:col-span-2">
                                            <InputField
                                                label="Facebook URL" icon={<FiFacebook />}
                                                value={formData.socialLinks.facebook}
                                                onChange={(e) => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="md:col-span-2 pt-6 flex gap-4 border-t border-slate-100 mt-4">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {saving ? "Saving..." : <><FiSave /> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Logout Section */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 py-3 rounded-xl font-semibold transition-colors"
                            >
                                <FiLogOut /> Sign Out
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Reusable Input Component to keep code clean
const InputField = ({ label, icon, name, value, onChange, placeholder, type = "text" }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 text-lg">{icon}</span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                placeholder={placeholder}
            />
        </div>
    </div>
);