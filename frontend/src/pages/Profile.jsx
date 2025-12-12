import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiShield, FiLogOut, FiEdit2, FiSave, FiX, FiCamera } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import userApi from "../api/authApi.js"; // Ensure this path is correct
import Nav from "../components/nav/Nav"; // Assuming you want the nav here

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    // 1. Load User Data
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFormData({
                name: parsedUser.name || "",
                email: parsedUser.email || "",
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Handle Update Logic
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Call API to save to database
            // We wait for this to finish to ensure no errors
            await userApi.updateUser(user._id || user.id, formData);

            // 2. Create the new user object manually using formData
            // This guarantees the UI updates with exactly what the user typed
            const newUserData = {
                ...user,             // Keep existing ID, role, token
                name: formData.name, // Force update name
                email: formData.email // Force update email
            };

            // 3. Update React State (Triggers immediate re-render of Profile & Nav)
            setUser(newUserData);

            // 4. Update Local Storage (Persists the change on refresh)
            localStorage.setItem("user", JSON.stringify(newUserData));

            setIsEditing(false);
            // toast.success("Profile updated!");
        } catch (error) {
            console.error("Update failed:", error);
            // toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };
    if (!user) return <div className="flex h-screen items-center justify-center text-slate-400">Loading Profile...</div>;

    const initials = user.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        : "U";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Optional: Include Nav if this is a full page */}
            <Nav cartCount={0} userRole={user.role} user={user.name} />

            <div className="max-w-2xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
                >
                    {/* Header / Banner */}
                    <div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                        {/* Edit Button Toggle */}
                        <div className="absolute top-4 right-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-all"
                                >
                                    <FiEdit2 /> Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email }); }}
                                    className="flex items-center gap-2 bg-rose-500/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition-all"
                                >
                                    <FiX /> Cancel
                                </button>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="absolute -bottom-12 left-8 md:left-12">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-1.5 shadow-xl relative group">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 text-3xl md:text-4xl font-bold border border-slate-200">
                                    {initials}
                                </div>
                                {/* Camera Icon Overlay (Visual only for now) */}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <FiCamera size={24} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="pt-16 pb-8 px-8 md:px-12">

                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                /* VIEW MODE */
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                                        <p className="text-slate-500 font-medium">{user.email}</p>
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm"><FiUser size={20} /></div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Account Type</p>
                                                <p className="font-semibold text-slate-700 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm"><FiShield size={20} /></div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Member Since</p>
                                                <p className="font-semibold text-slate-700">Dec 2025</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                /* EDIT MODE */
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <form onSubmit={handleUpdate} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                            <div className="relative">
                                                <FiUser className="absolute left-4 top-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                            <div className="relative">
                                                <FiMail className="absolute left-4 top-3.5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        {/* Read Only Field */}
                                        <div className="opacity-60 cursor-not-allowed">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Role (Read Only)</label>
                                            <div className="relative">
                                                <FiShield className="absolute left-4 top-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={user.role}
                                                    readOnly
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {loading ? "Saving..." : <><FiSave /> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Logout Button (Always Visible) */}
                        <div className="mt-10 pt-8 border-t border-slate-100">
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