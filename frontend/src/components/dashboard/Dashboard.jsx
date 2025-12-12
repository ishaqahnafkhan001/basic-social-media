
import React from 'react';
import { Star, Filter, Heart, LifeBuoy, MapPin, Clock } from 'lucide-react';
// 1. Import the external FilterSidebar component
import FilterSidebar from './DashboardSidebar.jsx'; // Adjust path as necessary

function Dashboard({
                       sortedTours,
                       totalToursCount,
                       sortBy,
                       setSortBy,
                       sortOrder,
                       handleSortOrderToggle,
                       isMobileFilterOpen,
                       handleMobileFilterToggle,
                       handleAddToCart,
                       // 2. New Filter Props received from parent
                       priceRange, setPriceRange,
                       duration, setDuration,
                       tourTypes, setTourTypes
                   }) {

    // Helper to consolidate filter props for easy passing
    const filterProps = { priceRange, setPriceRange, duration, setDuration, tourTypes, setTourTypes };

    return (
        <div className="flex">
            {/* Left Sidebar - Desktop (lg+) */}
            <aside className="hidden lg:block w-64 xl:w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] shadow-inner">
                {/* 3. Pass filter props to the FilterSidebar */}
                <FilterSidebar {...filterProps} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {/* Header and Sort Options */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Sorting Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-semibold text-slate-700">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            >
                                <option value="price">Price</option>
                                <option value="location">Location</option>
                                <option value="date">Date</option>
                            </select>
                            <button
                                onClick={handleSortOrderToggle}
                                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition py-2"
                            >
                                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                            </button>
                        </div>

                        {/* Mobile Filter Toggle & Count */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <span className="ml-auto sm:ml-0 text-sm font-medium text-slate-500">{totalToursCount} tours found</span>
                            <button
                                onClick={handleMobileFilterToggle}
                                className="lg:hidden p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
                                aria-expanded={isMobileFilterOpen}
                                aria-controls="mobile-filter-drawer"
                                title="Filter"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Drawer - Conditionally rendered */}
                {isMobileFilterOpen && (
                    <div id="mobile-filter-drawer" className="lg:hidden bg-white rounded-xl shadow-xl border border-slate-200 mb-6 transition-all duration-300 ease-in-out">
                        {/* 3. Pass filter props here too */}
                        <FilterSidebar {...filterProps} />
                    </div>
                )}


                {/* Tour Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {(sortedTours || []).map((tour) => (
                        <div key={tour.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg transition duration-300 hover:shadow-2xl hover:scale-[1.02] group">

                            {/* Image Area */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={tour.imageUrl}
                                    alt={tour.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    // Simple error handling for placeholder image
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/94A3B8/FFFFFF?text=Image+Unavailable" }}
                                />
                                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    {tour.type}
                                </span>
                                {/* Wishlist Button */}
                                <button
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-500 hover:text-white transition duration-300"
                                    title="Add to Wishlist"
                                >
                                    <Heart className="w-5 h-5 text-slate-600 group-hover:text-red-500 transition duration-300" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        {tour.location}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold text-slate-800">{tour.rating}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{tour.title}</h3>

                                {/* Details */}
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {tour.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(tour.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Price and Action */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <span className="text-sm text-slate-500">Starting From</span>
                                        <p className="text-2xl font-extrabold text-indigo-600">${tour.price}</p>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="px-6 py-3 bg-indigo-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;