import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTag } from "react-icons/fi";
import { tourCategories } from "../../../utils/tourCategories.jsx";
import { countries } from "../../../utils/countries";

export default function PostForm({ onSubmit, initialData, onCancel, isEditing }) {
    const [form, setForm] = useState({ title: "", content: "", country: "", category: "", image: "", tags: "" });

    useEffect(() => {
        if (initialData) {

            setForm({
                title: initialData.title || "",
                content: initialData.content || "",
                country: initialData.country || "",
                category: initialData.category || "",
                image: initialData.image || "",
                tags: initialData.tags ? initialData.tags.join(", ") : ""
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()) };
        onSubmit(payload);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const inputClass = "w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all";

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="flex justify-between mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {isEditing ? <><FiEdit2 className="text-blue-600" /> Edit Post</> : <><FiPlus className="text-green-600" /> Create Post</>}
                </h2>
                <button onClick={onCancel} className="text-sm text-gray-500 hover:text-red-500">Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Title" required />
                        <div className="grid grid-cols-2 gap-4">
                            <select name="country" value={form.country} onChange={handleChange} className={inputClass} required>
                                <option value="">Country...</option>
                                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select name="category" value={form.category} onChange={handleChange} className={inputClass} required>
                                <option value="">Category...</option>
                                {tourCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <FiTag className="absolute left-3 top-3.5 text-gray-400" />
                            <input name="tags" value={form.tags} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="Tags..." />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <textarea name="content" value={form.content} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="Content" required />
                        <input name="image" value={form.image} onChange={handleChange} className={inputClass} placeholder="Image URL" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:bg-blue-700 transition">
                        {isEditing ? "Update" : "Publish"}
                    </button>
                </div>
            </form>
        </div>
    );
}