import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTag, FiImage, FiType, FiMap, FiCheck, FiAlertCircle } from "react-icons/fi";
import { tourCategories } from "../../../utils/tourCategories.jsx";
import { countries } from "../../../utils/countries";

// Define defaults outside the component to prevent recreation on every render
const DEFAULT_FORM = {
    title: "",
    content: "",
    country: "",
    category: "",
    image: "",
    tags: ""
};

export default function PostForm({ onSubmit, initialData, onCancel, isEditing }) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [imageError, setImageError] = useState(false);

    // Sync state with props
    useEffect(() => {
        if (initialData) {
            // EDIT MODE: Populate form
            setForm({
                title: initialData.title || "",
                content: initialData.content || "",
                country: initialData.country || "",
                category: initialData.category || "",
                image: initialData.image || "",
                tags: initialData.tags && Array.isArray(initialData.tags)
                    ? initialData.tags.join(", ")
                    : initialData.tags || ""
            });
            setImageError(false); // Reset image error state
        } else {
            // CREATE MODE: Reset form
            setForm(DEFAULT_FORM);
            setImageError(false);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Data Cleaning: Convert comma-string back to Array for Backend
        const cleanedTags = form.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        const payload = { ...form, tags: cleanedTags };
        onSubmit(payload);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // If user changes image URL, reset error state to try loading again
        if (e.target.name === "image") setImageError(false);
    };

    // UI Helpers
    const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";
    const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400";
    const selectClass = "w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer";

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {isEditing ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><FiEdit2 /></div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><FiPlus /></div>
                    )}
                    {isEditing ? "Edit Tour Package" : "Create New Tour"}
                </h2>
                <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 px-3 py-1.5 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Inputs */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Title Input */}
                        <div>
                            <label className={labelClass}>Tour Title</label>
                            <div className="relative">
                                <FiType className="absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className={`${inputClass} pl-10 font-semibold`}
                                    placeholder="e.g. Magical Bali Escape"
                                    required
                                />
                            </div>
                        </div>

                        {/* Selectors Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Destination</label>
                                <div className="relative">
                                    <select name="country" value={form.country} onChange={handleChange} className={selectClass} required>
                                        <option value="">Select Country</option>
                                        {countries?.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400"><FiMap size={16}/></div>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Category</label>
                                <div className="relative">
                                    <select name="category" value={form.category} onChange={handleChange} className={selectClass} required>
                                        <option value="">Select Category</option>
                                        {tourCategories?.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                className={`${inputClass} min-h-[160px] resize-none leading-relaxed`}
                                placeholder="Describe the experience, itinerary, and highlights..."
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className={labelClass}>Tags (Comma separated)</label>
                            <div className="relative">
                                <FiTag className="absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    name="tags"
                                    value={form.tags}
                                    onChange={handleChange}
                                    className={`${inputClass} pl-10`}
                                    placeholder="beach, summer, hiking..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Image & Preview */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div>
                            <label className={labelClass}>Cover Image URL</label>
                            <div className="relative">
                                <FiImage className="absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    name="image"
                                    value={form.image}
                                    onChange={handleChange}
                                    className={`${inputClass} pl-10`}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        {/* Robust Preview Box */}
                        <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group min-h-[250px]">
                            {form.image && !imageError ? (
                                <>
                                    <img
                                        src={form.image}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={() => setImageError(true)}
                                    />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-3 text-white text-xs text-center translate-y-full group-hover:translate-y-0 transition-transform">
                                        Live Preview
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-slate-400 p-6">
                                    {imageError ? (
                                        <>
                                            <FiAlertCircle size={48} className="mx-auto mb-3 text-rose-300" />
                                            <p className="text-sm font-medium text-rose-500">Invalid Image URL</p>
                                        </>
                                    ) : (
                                        <>
                                            <FiImage size={48} className="mx-auto mb-3 opacity-30" />
                                            <p className="text-sm font-medium">Image preview</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
                    >
                        <FiCheck strokeWidth={3} />
                        {isEditing ? "Update Tour" : "Publish Tour"}
                    </button>
                </div>
            </form>
        </div>
    );
}