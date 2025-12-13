import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FiMenu, FiPlus, FiTrash2, FiEdit2, FiMapPin,
    FiCalendar, FiSearch, FiAlertCircle, FiLoader
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Components & Hooks
import tourApi from "../api/tourApi";
import Sidebar from "../components/layout/Sidebar.jsx";
import Nav from "../components/nav/Nav.jsx";
import useUser from "../hooks/userInfo";

const MyCreatedTour = () => {
    const navigate = useNavigate();
    const { role } = useUser() || { role: "agency" };

    // ------------------------------
    // STATE
    // ------------------------------
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ------------------------------
    // EFFECTS
    // ------------------------------
    useEffect(() => {
        fetchMyTours();
    }, []);

    const fetchMyTours = async () => {
        try {
            setLoading(true);
            const response = await tourApi.getMyTours();
            // Assuming response.data.data contains the array, or response.data depending on your backend
            const tourData = response.data.data || response.data;
            setTours(tourData);
        } catch (err) {
            console.error(err);
            setError("Failed to load your tours. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------
    // HANDLERS
    // ------------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tour? This action cannot be undone.")) {
            return;
        }

        try {
            await tourApi.remove(id);
            // Optimistic UI update: remove from list immediately
            setTours((prev) => prev.filter((tour) => tour._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete tour");
        }
    };

    // Filter logic for search
    const filteredTours = tours.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.destinationCity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ------------------------------
    // RENDER HELPERS
    // ------------------------------
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Nav cartCount={0} userRole={role} />
            </div>

            <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">

                {/* Mobile Sidebar Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed md:sticky top-0 h-screen md:h-[calc(100vh-80px)] z-50 md:z-0
                    transition-transform duration-300 ease-in-out bg-white border-r border-slate-200
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeTab="tour-ongoing" // Or "all-blog" / specialized tab
                        setActiveTab={() => {}}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 lg:px-12 overflow-y-auto min-h-[calc(100vh-80px)]">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm"
                            >
                                <FiMenu size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                    My Tours
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage your active packages and drafts.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to="/create-tour"
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                <FiPlus /> Create New
                            </Link>
                        </div>
                    </div>

                    {/* Search & Stats Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-96">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tours by title or city..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                            Total Tours: <span className="text-slate-900">{tours.length}</span>
                        </div>
                    </div>

                    {/* Content State Handling */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <FiLoader className="animate-spin text-3xl mb-2 text-blue-500" />
                            <p>Loading your adventures...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                            <FiAlertCircle /> {error}
                        </div>
                    ) : filteredTours.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <FiMapPin size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No Tours Found</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                {searchTerm ? "No tours match your search." : "You haven't created any tour packages yet."}
                            </p>
                            {!searchTerm && (
                                <Link to="/create-tour" className="text-blue-600 font-medium hover:underline">
                                    Start creating your first tour &rarr;
                                </Link>
                            )}
                        </div>
                    ) : (
                        /* Table / List View */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="p-4 pl-6">Tour Details</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">Date & Price</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    <AnimatePresence>
                                        {filteredTours.map((tour) => (
                                            <motion.tr
                                                key={tour._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-100">
                                                            <img
                                                                src={tour.coverImage || ""}
                                                                alt={tour.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 line-clamp-1">{tour.title}</h4>
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                                    {tour.category}
                                                                </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <FiMapPin className="text-slate-400" />
                                                        {tour.destinationCity}, {tour.destinationCountry}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-slate-900">${tour.pricePerPerson}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <FiCalendar size={10} />
                                                        {formatDate(tour.startDate)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {tour.isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                Active
                                                            </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                                Draft
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="p-4 pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Edit Button - Needs /edit-tour/:id route */}
                                                        <Link
                                                            to={`/update-tour/${tour._id}`}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit Tour"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </Link>

                                                        <button
                                                            onClick={() => handleDelete(tour._id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete Tour"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyCreatedTour;