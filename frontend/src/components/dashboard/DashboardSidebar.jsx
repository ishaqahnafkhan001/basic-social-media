import React from 'react';
import { Heart, LifeBuoy } from 'lucide-react';

const TOUR_TYPES = ['Adventure', 'Cultural', 'Beach', 'Relaxation'];
const FilterSidebar = ({
                           priceRange,
                           setPriceRange,
                           duration,
                           setDuration,
                           tourTypes = [], // <<< FIX IS HERE: Default to an empty array if undefined
                           setTourTypes
                       }) => {

    const handleTypeChange = (type) => {
        setTourTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    return (
        <div className="p-6 space-y-8">
            {/* Filters Section */}
            <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 border-b pb-2 border-slate-100">Filter Tours</h3>
                <div className="space-y-4">
                    {/* Price Range */}
                    <div className="p-3 bg-slate-50 rounded-lg shadow-inner">
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Price Range</label>
                        <input
                            type="range"
                            min="0"
                            max="3000"
                            value={priceRange} // Use state value
                            onChange={(e) => setPriceRange(Number(e.target.value))} // Update state
                            className="w-full h-1 bg-indigo-200 rounded-lg appearance-none cursor-pointer range-sm"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>$0</span>
                            <span>${priceRange}</span> {/* Display current value */}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="p-3 bg-slate-50 rounded-lg shadow-inner">
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Duration</label>
                        <select
                            value={duration} // Use state value
                            onChange={(e) => setDuration(e.target.value)} // Update state
                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="any">Any duration</option>
                            <option value="short">1-3 days</option>
                            <option value="medium">4-7 days</option>
                            <option value="long">7+ days</option>
                        </select>
                    </div>

                    {/* Tour Type */}
                    <div className="p-3 bg-slate-50 rounded-lg shadow-inner">
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Tour Type</label>
                        <div className="space-y-2">
                            {TOUR_TYPES.map(type => (
                                <label key={type}
                                       className="flex items-center text-sm text-slate-700 cursor-pointer hover:text-indigo-600 transition">
                                    <input
                                        type="checkbox"
                                        checked={tourTypes.includes(type)} // Now this is safe, as tourTypes is guaranteed to be an array
                                        onChange={() => handleTypeChange(type)}
                                        className="mr-3 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="pt-6 border-t border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <a href="#"
                       className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-indigo-600 transition p-2 rounded-lg hover:bg-indigo-50">
                        <Heart className="w-5 h-5 text-red-500"/>
                        Wishlist
                    </a>
                    <a href="#"
                       className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-indigo-600 transition p-2 rounded-lg hover:bg-indigo-50">
                        <LifeBuoy className="w-5 h-5 text-green-500"/>
                        24/7 Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;