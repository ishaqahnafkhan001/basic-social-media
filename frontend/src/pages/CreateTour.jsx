import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiPlus, FiTrash2, FiImage, FiCalendar, FiMapPin, FiUploadCloud, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

// Components & Hooks
import tourApi from "../api/tourApi";
import { tourCategories } from "../../utils/tourCategories";
import { countries } from "../../utils/countries";
import Sidebar from "../components/layout/Sidebar.jsx";
import Nav from "../components/nav/Nav.jsx";
import useUser from "../hooks/userInfo";

const CreateTour = () => {
    const navigate = useNavigate();
    const { role } = useUser() || { role: "admin" };

    // ------------------------------
    // UI STATE
    // ------------------------------
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ------------------------------
    // FORM DATA STATE
    // ------------------------------
    const [formData, setFormData] = useState({
        title: "",
        category: tourCategories[0] || "Adventure",
        destinationCountry: "",
        destinationCity: "",
        startDate: "",
        endDate: "",
        pricePerPerson: "",
        maxGroupSize: "",
        difficulty: "Medium",
        description: "",
        inclusions: ["Accommodation", "Guide"],
        exclusions: ["Flights", "Personal Expenses"],
        itinerary: [{ day: 1, title: "", description: "" }],
    });

    // ------------------------------
    // FILE STATE (NEW)
    // ------------------------------
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const [galleryFiles, setGalleryFiles] = useState([]); // Array of File objects
    const [galleryPreviews, setGalleryPreviews] = useState([]); // Array of Blob URLs

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (coverPreview) URL.revokeObjectURL(coverPreview);
            galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [coverPreview, galleryPreviews]);

    // ------------------------------
    // HANDLERS
    // ------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- NEW: Handle Cover Image File ---
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    // --- NEW: Handle Gallery Files (Multiple) ---
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Append new files to existing ones
            const newFiles = [...galleryFiles, ...files];
            setGalleryFiles(newFiles);

            // Generate previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews([...galleryPreviews, ...newPreviews]);
        }
    };

    const removeGalleryImage = (index) => {
        const updatedFiles = galleryFiles.filter((_, i) => i !== index);
        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);

        // Revoke the removed URL to free memory
        URL.revokeObjectURL(galleryPreviews[index]);

        setGalleryFiles(updatedFiles);
        setGalleryPreviews(updatedPreviews);
    };

    // --- Simple Array Handlers (Inclusions/Exclusions) ---
    const handleArrayChange = (field, index, value) => {
        const arr = [...formData[field]];
        arr[index] = value;
        setFormData({ ...formData, [field]: arr });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const removeArrayItem = (field, index) => {
        setFormData({
            ...formData,
            [field]: formData[field].filter((_, i) => i !== index),
        });
    };

    // --- Itinerary Handlers ---
    const handleItineraryChange = (index, key, value) => {
        const days = [...formData.itinerary];
        days[index][key] = value;
        setFormData({ ...formData, itinerary: days });
    };

    const addItineraryDay = () => {
        setFormData({
            ...formData,
            itinerary: [
                ...formData.itinerary,
                { day: formData.itinerary.length + 1, title: "", description: "" },
            ],
        });
    };

    const removeItineraryDay = (index) => {
        const updated = formData.itinerary.filter((_, i) => i !== index);
        const reindexed = updated.map((d, i) => ({ ...d, day: i + 1 }));
        setFormData({ ...formData, itinerary: reindexed });
    };

    // ------------------------------
    // SUBMIT (UPDATED FOR FORM DATA)
    // ------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validation
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            setError("End Date must be after Start Date.");
            setLoading(false);
            return;
        }

        if (!coverFile) {
            setError("Cover image is required.");
            setLoading(false);
            return;
        }

        if (galleryFiles.length < 2) {
            setError("Please upload at least 2 gallery images.");
            setLoading(false);
            return;
        }

        try {
            // 1. Create FormData object
            const data = new FormData();

            // 2. Append Simple Fields
            Object.keys(formData).forEach(key => {
                // Skip arrays for now, handle them specifically below
                if (!['images', 'inclusions', 'exclusions', 'itinerary'].includes(key)) {
                    data.append(key, formData[key]);
                }
            });

            // 3. Append Complex Arrays (Must be stringified for backend to parse)
            data.append('inclusions', JSON.stringify(formData.inclusions.filter(v => v.trim() !== "")));
            data.append('exclusions', JSON.stringify(formData.exclusions.filter(v => v.trim() !== "")));
            data.append('itinerary', JSON.stringify(formData.itinerary));

            // 4. Append Files
            data.append('coverImage', coverFile);

            galleryFiles.forEach((file) => {
                data.append('images', file);
            });

            // 5. Send Request (Important: api client must handle Content-Type: multipart/form-data)
            // Axios usually detects FormData and sets headers automatically.
            await tourApi.create(data);

            alert("Tour Created Successfully!");
            navigate("/agency/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Could not create the tour.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------
    // SHARED STYLES
    // ------------------------------
    const inputClass = "w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-2";
    const sectionClass = "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-8";

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
                        activeTab="create-tour"
                        setActiveTab={() => {}}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 lg:px-12 overflow-y-auto min-h-[calc(100vh-80px)]">

                    {/* Header */}
                    <header className="flex items-center gap-4 mb-8">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg bg-white border border-slate-200">
                            <FiMenu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Create Tour Package</h1>
                            <p className="text-sm text-slate-500 mt-1">Fill in the details below to publish a new adventure.</p>
                        </div>
                    </header>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6">
                            <span className="font-bold">Error:</span> {error}
                        </motion.div>
                    )}

                    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="max-w-5xl mx-auto">

                        {/* 1. BASIC INFO */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span> Basic Information
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className={labelClass}>Tour Title</label>
                                    <input type="text" name="title" className={inputClass} value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Category</label>
                                        <select name="category" className={inputClass} value={formData.category} onChange={handleChange}>
                                            {tourCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Difficulty</label>
                                        <select name="difficulty" className={inputClass} value={formData.difficulty} onChange={handleChange}>
                                            {["Easy", "Medium", "Hard", "Extreme"].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. LOCATION & LOGISTICS (Same as before) */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span> Location & Logistics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClass}><FiMapPin className="inline mr-1"/> Country</label>
                                    <select name="destinationCountry" className={inputClass} required value={formData.destinationCountry} onChange={handleChange}>
                                        <option value="">Select Country</option>
                                        {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="lg:col-span-2">
                                    <label className={labelClass}>City / Region</label>
                                    <input type="text" name="destinationCity" className={inputClass} value={formData.destinationCity} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className={labelClass}><FiCalendar className="inline mr-1"/> Start Date</label>
                                    <input type="date" name="startDate" className={inputClass} value={formData.startDate} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className={labelClass}><FiCalendar className="inline mr-1"/> End Date</label>
                                    <input type="date" name="endDate" className={inputClass} value={formData.endDate} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Max Group Size</label>
                                    <input type="number" name="maxGroupSize" className={inputClass} min={1} value={formData.maxGroupSize} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Price ($)</label>
                                    <input type="number" name="pricePerPerson" className={inputClass} min={0} value={formData.pricePerPerson} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* 3. DESCRIPTION */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span> Description
                            </h2>
                            <textarea name="description" rows="6" className={inputClass} value={formData.description} onChange={handleChange} required />
                        </div>

                        {/* 4. VISUALS (UPDATED FOR FILE UPLOAD) */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span> Visuals
                            </h2>

                            {/* Cover Image */}
                            <div className="mb-8">
                                <label className={labelClass}><FiImage className="inline mr-1"/> Cover Image</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition relative">
                                    <input
                                        type="file"
                                        name="coverImage"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {coverPreview ? (
                                        <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition">
                                                Click to Change
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-slate-400 flex flex-col items-center">
                                            <FiUploadCloud size={32} className="mb-2" />
                                            <span>Click to upload Cover Image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className={labelClass}>Gallery Images (Min 2)</label>

                                {/* Upload Button */}
                                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition mb-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleGalleryChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-blue-600 font-medium flex flex-col items-center">
                                        <FiPlus size={24} className="mb-1"/>
                                        <span>Click to add images (Select multiple)</span>
                                    </div>
                                </div>

                                {/* Previews Grid */}
                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {galleryPreviews.map((src, index) => (
                                            <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 h-32">
                                                <img src={src} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 5. ITINERARY (Unchanged Logic, just renders) */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span> Daily Itinerary
                            </h2>
                            <div className="space-y-4">
                                {formData.itinerary.map((day, index) => (
                                    <div key={index} className="border border-slate-200 rounded-xl p-5 bg-slate-50 relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">DAY {day.day}</span>
                                            {formData.itinerary.length > 1 && (
                                                <button type="button" className="text-slate-400 hover:text-red-500" onClick={() => removeItineraryDay(index)}><FiTrash2 /></button>
                                            )}
                                        </div>
                                        <input type="text" className={`${inputClass} mb-3`} placeholder="Day Title" required value={day.title} onChange={(e) => handleItineraryChange(index, "title", e.target.value)} />
                                        <textarea className={inputClass} rows="2" placeholder="Activities..." value={day.description} onChange={(e) => handleItineraryChange(index, "description", e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2" onClick={addItineraryDay}>
                                <FiPlus /> Add Day {formData.itinerary.length + 1}
                            </button>
                        </div>

                        {/* 6. INCLUSIONS & EXCLUSIONS (Render logic unchanged) */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">6</span> Inclusions & Exclusions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-green-700 mb-3">What's Included</h3>
                                    <div className="space-y-2">
                                        {formData.inclusions.map((item, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <input type="text" className={`${inputClass} !py-2`} value={item} onChange={(e) => handleArrayChange("inclusions", index, e.target.value)} />
                                                <button type="button" onClick={() => removeArrayItem("inclusions", index)} className="text-slate-400 hover:text-red-500">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addArrayItem("inclusions")} className="mt-2 text-sm text-green-700 font-medium hover:underline">+ Add Included Item</button>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-700 mb-3">What's Not Included</h3>
                                    <div className="space-y-2">
                                        {formData.exclusions.map((item, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <input type="text" className={`${inputClass} !py-2`} value={item} onChange={(e) => handleArrayChange("exclusions", index, e.target.value)} />
                                                <button type="button" onClick={() => removeArrayItem("exclusions", index)} className="text-slate-400 hover:text-red-500">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addArrayItem("exclusions")} className="mt-2 text-sm text-red-700 font-medium hover:underline">+ Add Excluded Item</button>
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT ACTIONS */}
                        <div className="flex justify-end gap-4 py-6">
                            <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={loading} className={`px-8 py-3 rounded-xl text-white font-medium shadow-lg shadow-blue-200 transition-all ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1"}`}>
                                {loading ? "Uploading..." : "Publish Tour"}
                            </button>
                        </div>
                    </motion.form>
                </main>
            </div>
        </div>
    );
};

export default CreateTour;