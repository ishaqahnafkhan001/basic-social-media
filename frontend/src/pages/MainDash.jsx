import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Nav from '../components/nav/Nav.jsx';
import Dashboard from '../components/dashboard/Dashboard.jsx';
import tourApi from '../api/tourApi.js';

// Helper: Calculate days between two dates
const calculateDuration = (start, end) => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
};

// Helper: Map frontend sort keys to Backend Schema fields
const getBackendSortParam = (sortBy, sortOrder) => {
    let field = 'createdAt';
    if (sortBy === 'price') field = 'pricePerPerson';
    if (sortBy === 'date') field = 'startDate';
    return sortOrder === 'desc' ? `-${field}` : field;
};

function MainDash() {
    // --- Global State ---
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0); // 👈 NEW: To show accurate total results
    const LIMIT = 9;

    // --- Sorting & Filtering State ---
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');
    const [priceRange, setPriceRange] = useState(50000);
    const [durationFilter, setDurationFilter] = useState('any');
    const [tourTypesFilter, setTourTypesFilter] = useState([]);

    // --- Fetch Data from API ---
    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);

                const params = {
                    page: page,
                    limit: LIMIT,
                    maxPrice: priceRange,
                    sort: getBackendSortParam(sortBy, sortOrder)
                };

                const response = await tourApi.getAll(params);

                let rawData = [];
                // Handle response structure
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    rawData = response.data.data;

                    if (response.data.totalPages) {
                        setTotalPages(response.data.totalPages);
                    }
                    // 👇 NEW: Set the total count from backend (e.g., 50)
                    // instead of page count (e.g., 9)
                    if (response.data.count) {
                        setTotalCount(response.data.count);
                    }
                } else if (response.data && Array.isArray(response.data)) {
                    rawData = response.data;
                    setTotalCount(rawData.length);
                }

                setTours(rawData);
                setError(null);
            } catch (err) {
                console.error("Fetch error details:", err);
                setError("Failed to load tours.");
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, [page, sortBy, sortOrder, priceRange]);

    // --- Callbacks ---
    const handleAddToCart = useCallback(() => {
        setCartCount(prev => prev + 1);
    }, []);

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    const handleMobileFilterToggle = useCallback(() => {
        setIsMobileFilterOpen(prev => !prev);
    }, []);

    // --- Pagination Handlers ---
    const handleNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    // --- Data Processing ---
    const processedTours = useMemo(() => {
        if (!Array.isArray(tours) || tours.length === 0) return [];

        const normalizedTours = tours.map(tour => {
            if (!tour) return null;
            const durationValue = calculateDuration(tour.startDate, tour.endDate);

            return {
                id: tour._id || Math.random(),
                title: tour.title || "Untitled Tour",
                location: tour.destinationCity && tour.destinationCountry
                    ? `${tour.destinationCity}, ${tour.destinationCountry}`
                    : "Unknown Location",
                price: tour.pricePerPerson || 0,
                imageUrl: tour.coverImage || "https://placehold.co/400x250?text=No+Image",
                type: tour.category || "General",
                date: tour.startDate || new Date().toISOString(),
                duration: `${durationValue} days`,
                durationValue: durationValue,
                rating: tour.rating || 4.5,
                agencyName: tour.agency?.username || tour.agency?.name || "Partner Agency"
            };
        }).filter(Boolean);

        return normalizedTours.filter(tour => {
            if (tourTypesFilter.length > 0 && !tourTypesFilter.includes(tour.type)) return false;
            if (durationFilter !== 'any') {
                const d = tour.durationValue;
                if (durationFilter === 'short' && (d < 1 || d > 3)) return false;
                if (durationFilter === 'medium' && (d < 4 || d > 7)) return false;
                if (durationFilter === 'long' && d <= 7) return false;
            }
            return true;
        });
    }, [tours, durationFilter, tourTypesFilter]);

    if (loading) return <div className="min-h-screen flex justify-center items-center text-indigo-600 font-bold">Loading...</div>;
    if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Nav cartCount={cartCount} />

            <Dashboard
                sortedTours={processedTours}
                totalToursCount={totalCount} // 👈 UPDATE: Pass totalCount instead of processedTours.length
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                handleSortOrderToggle={handleSortOrderToggle}
                isMobileFilterOpen={isMobileFilterOpen}
                handleMobileFilterToggle={handleMobileFilterToggle}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                duration={durationFilter}
                setDuration={setDurationFilter}
                tourTypes={tourTypesFilter}
                setTourTypes={setTourTypesFilter}
                handleAddToCart={handleAddToCart}
            />

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-md font-semibold ${
                        page === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    Previous
                </button>

                <span className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                </span>

                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-md font-semibold ${
                        page === totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default MainDash;