import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiMenu, FiPlus, FiTrash2, FiImage, FiCalendar, FiMapPin, FiLoader, FiArrowLeft, FiUploadCloud, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

// Components & Hooks
import tourApi from "../api/tourApi";
import { tourCategories } from "../../utils/tourCategories";
import { countries } from "../../utils/countries";
import Sidebar from "../components/layout/Sidebar.jsx";
import Nav from "../components/nav/Nav.jsx";
import useUser from "../hooks/userInfo";

const UpdateTour = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useUser() || { role: "agency" };

    // ------------------------------
    // UI STATE
    // ------------------------------
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ------------------------------
    // DATA STATE
    // ------------------------------
    const [formData, setFormData] = useState({
        title: "",
        isActive: true,
        category: "",
        destinationCountry: "",
        destinationCity: "",
        startDate: "",
        endDate: "",
        pricePerPerson: "",
        maxGroupSize: "",
        difficulty: "Medium",
        description: "",
        inclusions: [],
        exclusions: [],
        itinerary: [],
    });

    // ------------------------------
    // IMAGE STATE
    // ------------------------------
    // Cover
    const [existingCover, setExistingCover] = useState(""); // URL from DB
    const [coverFile, setCoverFile] = useState(null);       // New File
    const [coverPreview, setCoverPreview] = useState("");   // Preview of New File

    // Gallery
    const [existingGallery, setExistingGallery] = useState([]); // URLs from DB
    const [galleryFiles, setGalleryFiles] = useState([]);       // New Files
    const [galleryPreviews, setGalleryPreviews] = useState([]); // Previews of New Files

    // Cleanup Object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (coverPreview) URL.revokeObjectURL(coverPreview);
            galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [coverPreview, galleryPreviews]);

    // ------------------------------
    // FETCH DATA
    // ------------------------------
    useEffect(() => {
        const fetchTourDetails = async () => {
            try {
                const response = await tourApi.getById(id);
                const data = response.data.data || response.data;

                const formatDate = (dateString) => {
                    if (!dateString) return "";
                    return new Date(dateString).toISOString().split('T')[0];
                };

                // Populate Text Data
                setFormData({
                    title: data.title || "",
                    isActive: data.isActive,
                    category: data.category || "",
                    destinationCountry: data.destinationCountry || "",
                    destinationCity: data.destinationCity || "",
                    startDate: formatDate(data.startDate),
                    endDate: formatDate(data.endDate),
                    pricePerPerson: data.pricePerPerson || "",
                    maxGroupSize: data.maxGroupSize || "",
                    difficulty: data.difficulty || "Medium",
                    description: data.description || "",
                    inclusions: data.inclusions || [],
                    exclusions: data.exclusions || [],
                    itinerary: data.itinerary || [],
                });

                // Populate Images
                setExistingCover(data.coverImage);
                setExistingGallery(data.images || []);

            } catch (err) {
                console.error(err);
                setError("Could not load tour details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTourDetails();
    }, [id]);

    // ------------------------------
    // HANDLERS
    // ------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleActiveStatus = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    // --- Image Handlers ---

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setGalleryFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewGalleryImage = (index) => {
        const updatedFiles = galleryFiles.filter((_, i) => i !== index);
        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
        URL.revokeObjectURL(galleryPreviews[index]); // Cleanup
        setGalleryFiles(updatedFiles);
        setGalleryPreviews(updatedPreviews);
    };

    const clearNewGallery = () => {
        galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        setGalleryFiles([]);
        setGalleryPreviews([]);
    };

    // --- Array Handlers (Strings) ---

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
    // SUBMIT (FORMDATA)
    // ------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            setError("End Date must be after Start Date.");
            setSubmitting(false);
            return;
        }

        try {
            // 1. Create FormData
            const data = new FormData();

            // 2. Append Simple Fields
            Object.keys(formData).forEach(key => {
                if (!['inclusions', 'exclusions', 'itinerary'].includes(key)) {
                    data.append(key, formData[key]);
                }
            });

            // 3. Append Complex Arrays (Stringified for backend parsing)
            // Note: filter empty strings out
            data.append('inclusions', JSON.stringify(formData.inclusions.filter(v => v.trim() !== "")));
            data.append('exclusions', JSON.stringify(formData.exclusions.filter(v => v.trim() !== "")));
            // Remove _id from itinerary items if they exist (clean update)
            const cleanItinerary = formData.itinerary.map(({ _id, ...rest }) => rest);
            data.append('itinerary', JSON.stringify(cleanItinerary));

            // 4. Append Files (Only if they exist)
            if (coverFile) {
                data.append('coverImage', coverFile);
            }

            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => {
                    data.append('images', file);
                });
            }

            // 5. Send Request
            // Note: Content-Type is handled automatically by Axios/Browser for FormData
            await tourApi.update(id, data);

            alert("Tour Updated Successfully!");
            navigate("/tours/my-tours");

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Could not update the tour.");
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------
    // STYLES & RENDERING
    // ------------------------------
    const inputClass = "w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-2";
    const sectionClass = "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-8";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
                <FiLoader className="animate-spin text-3xl mr-2 text-blue-600" /> Loading tour details...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Nav cartCount={0} userRole={role} />
            </div>

            <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">
                {/* Sidebar Backdrop */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <div className={`fixed md:sticky top-0 h-screen md:h-[calc(100vh-80px)] z-50 md:z-0 transition-transform duration-300 ease-in-out bg-white border-r border-slate-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab="tour-ongoing" setActiveTab={() => {}} />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 lg:px-12 overflow-y-auto min-h-[calc(100vh-80px)]">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm transition"><FiMenu size={20} /></button>
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition hidden md:block"><FiArrowLeft size={20} /></button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Edit Tour Package</h1>
                                <p className="text-sm text-slate-500 mt-1">Update details for <span className="font-semibold text-blue-600">{formData.title}</span></p>
                            </div>
                        </div>
                    </header>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
                            <span className="font-bold">Error:</span> {error}
                        </motion.div>
                    )}

                    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="max-w-5xl mx-auto">

                        {/* 1. BASIC INFO */}
                        <div className={sectionClass}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span> Basic Information
                                </h2>
                                {/* Status Toggle */}
                                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500 hidden sm:block">Status:</span>
                                    <button type="button" onClick={toggleActiveStatus} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <span className={`${formData.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200`} />
                                    </button>
                                    <span className={`text-sm font-bold w-16 ${formData.isActive ? 'text-green-600' : 'text-slate-500'}`}>{formData.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div><label className={labelClass}>Tour Title</label><input type="text" name="title" required className={inputClass} value={formData.title} onChange={handleChange} /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>Category</label><select name="category" className={inputClass} value={formData.category} onChange={handleChange}>{tourCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}</select></div>
                                    <div><label className={labelClass}>Difficulty</label><select name="difficulty" className={inputClass} value={formData.difficulty} onChange={handleChange}>{["Easy", "Medium", "Hard", "Extreme"].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}</select></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. LOCATION & LOGISTICS */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span> Location & Logistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div><label className={labelClass}><FiMapPin className="inline mr-1"/> Country</label><select name="destinationCountry" className={inputClass} required value={formData.destinationCountry} onChange={handleChange}><option value="">Select Country</option>{countries.map((c, i) => <option key={i} value={c}>{c}</option>)}</select></div>
                                <div className="lg:col-span-2"><label className={labelClass}>City / Region</label><input type="text" name="destinationCity" required className={inputClass} value={formData.destinationCity} onChange={handleChange} /></div>
                                <div><label className={labelClass}><FiCalendar className="inline mr-1"/> Start Date</label><input type="date" name="startDate" className={inputClass} required value={formData.startDate} onChange={handleChange} /></div>
                                <div><label className={labelClass}><FiCalendar className="inline mr-1"/> End Date</label><input type="date" name="endDate" className={inputClass} required value={formData.endDate} onChange={handleChange} /></div>
                                <div><label className={labelClass}>Max Group Size</label><input type="number" name="maxGroupSize" className={inputClass} min={1} required value={formData.maxGroupSize} onChange={handleChange} /></div>
                                <div><label className={labelClass}>Price ($)</label><input type="number" name="pricePerPerson" className={inputClass} min={0} required value={formData.pricePerPerson} onChange={handleChange} /></div>
                            </div>
                        </div>

                        {/* 3. DESCRIPTION */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span> Description</h2>
                            <textarea name="description" rows="6" className={inputClass} required value={formData.description} onChange={handleChange} />
                        </div>

                        {/* 4. VISUALS (MODIFIED FOR FILE UPLOAD) */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span> Visuals
                            </h2>

                            {/* Cover Image */}
                            <div className="mb-8">
                                <label className={labelClass}><FiImage className="inline mr-1"/> Cover Image</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Existing / Current */}
                                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                        <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Current Cover</p>
                                        <div className="w-full h-48 rounded overflow-hidden bg-slate-200">
                                            <img src={coverPreview || existingCover} alt="Current Cover" className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    {/* Upload New */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition relative">
                                        <input type="file" name="coverImage" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="text-center pointer-events-none">
                                            <FiUploadCloud size={32} className="mx-auto text-blue-500 mb-2" />
                                            <p className="text-sm font-medium text-slate-700">Click to Upload New Cover</p>
                                            <p className="text-xs text-slate-400">Replaces current image</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery */}
                            <div>
                                <label className={labelClass}>Gallery Images</label>

                                {/* 1. Existing Gallery Display */}
                                {existingGallery.length > 0 && galleryFiles.length === 0 && (
                                    <div className="mb-6">
                                        <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Current Gallery</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {existingGallery.map((src, i) => (
                                                <div key={i} className="h-24 rounded overflow-hidden border border-slate-200">
                                                    <img src={src} alt="Gallery" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 2. New Uploads */}
                                <div className="mb-4">
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition mb-4">
                                        <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="text-blue-600 font-medium flex flex-col items-center">
                                            <FiPlus size={24} className="mb-1"/>
                                            <span>Upload New Gallery Images</span>
                                            <span className="text-xs text-slate-400 font-normal mt-1">(Uploading new images will replace the entire current gallery)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. New Previews */}
                                {galleryPreviews.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-xs text-green-600 font-bold uppercase">New Images to Upload</p>
                                            <button type="button" onClick={clearNewGallery} className="text-xs text-red-500 underline">Clear All</button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {galleryPreviews.map((src, index) => (
                                                <div key={index} className="relative group rounded-lg overflow-hidden border border-green-200 h-24">
                                                    <img src={src} alt={`New Gallery ${index}`} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeNewGalleryImage(index)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm">
                                                        <FiX size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 5. ITINERARY (Text Only) */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span> Daily Itinerary</h2>
                            <div className="space-y-4">
                                {formData.itinerary.map((day, index) => (
                                    <div key={index} className="border border-slate-200 rounded-xl p-5 bg-slate-50 relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">DAY {day.day}</span>
                                            {formData.itinerary.length > 1 && <button type="button" className="text-slate-400 hover:text-red-500" onClick={() => removeItineraryDay(index)}><FiTrash2 /></button>}
                                        </div>
                                        <input type="text" className={`${inputClass} mb-3`} value={day.title} onChange={(e) => handleItineraryChange(index, "title", e.target.value)} />
                                        <textarea className={inputClass} rows="2" value={day.description} onChange={(e) => handleItineraryChange(index, "description", e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-blue-50 transition" onClick={addItineraryDay}><FiPlus className="inline mr-2" /> Add Day {formData.itinerary.length + 1}</button>
                        </div>

                        {/* 6. INCLUSIONS & EXCLUSIONS */}
                        <div className={sectionClass}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">6</span> Inclusions & Exclusions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-green-700 mb-3">What's Included</h3>
                                    {formData.inclusions.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center mb-2">
                                            <input type="text" className={`${inputClass} !py-2`} value={item} onChange={(e) => handleArrayChange("inclusions", index, e.target.value)} />
                                            <button type="button" onClick={() => removeArrayItem("inclusions", index)} className="text-slate-400 hover:text-red-500">✕</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addArrayItem("inclusions")} className="mt-2 text-sm text-green-700 hover:underline">+ Add Included Item</button>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-700 mb-3">What's Not Included</h3>
                                    {formData.exclusions.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center mb-2">
                                            <input type="text" className={`${inputClass} !py-2`} value={item} onChange={(e) => handleArrayChange("exclusions", index, e.target.value)} />
                                            <button type="button" onClick={() => removeArrayItem("exclusions", index)} className="text-slate-400 hover:text-red-500">✕</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addArrayItem("exclusions")} className="mt-2 text-sm text-red-700 hover:underline">+ Add Excluded Item</button>
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT ACTIONS */}
                        <div className="flex justify-end gap-4 py-6">
                            <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting} className={`px-8 py-3 rounded-xl text-white font-medium shadow-lg shadow-blue-200 transition-all ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1"}`}>
                                {submitting ? "Updating..." : "Update Tour"}
                            </button>
                        </div>
                    </motion.form>
                </main>
            </div>
        </div>
    );
};

export default UpdateTour;