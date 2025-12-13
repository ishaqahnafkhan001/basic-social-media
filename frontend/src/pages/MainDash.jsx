import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Nav from '../components/nav/Nav.jsx';
import Dashboard from '../components/dashboard/Dashboard.jsx';
import tourApi from '../api/tourApi.js';

// Helper: Calculate days between two dates
const calculateDuration = (start, end) => {
    if (!start || !end) return 1; // Safety check
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
};

function MainDash() {
    // --- Global State ---
    // Initialize as empty array to prevent .map() crashes
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cartCount, setCartCount] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Sorting & Filtering State ---
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');
    const [priceRange, setPriceRange] = useState(50000);
    const [durationFilter, setDurationFilter] = useState('any');
    const [tourTypesFilter, setTourTypesFilter] = useState([]);

    // --- Fetch Data from API ---
    // --- Fetch Data from API ---
    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);

                // CORRECT CALL:
                // Only pass the empty object {} (or your filters).
                // Do NOT pass the URL string.
                const response = await tourApi.getAll({});

// Debugging: confirm what we are grabbing
                console.log("Raw API Body:", response.data);

                let rawData = [];

// Your screenshot shows the array is inside response.data.data
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    rawData = response.data.data;
                }
// Fallback for other structures
                else if (response.data && Array.isArray(response.data)) {
                    rawData = response.data;
                }

                console.log("Extracted Tours:", rawData); // <--- Check this console log
                setTours(rawData);

                setTours(rawData);
                setError(null);
            } catch (err) {
                console.error("Fetch error details:", err);
                setError("Failed to load tours. Please check console for details.");
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

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

    // --- Data Processing ---
    const processedTours = useMemo(() => {
        // Safety check: Ensure tours is an array before mapping
        if (!Array.isArray(tours) || tours.length === 0) return [];

        // 1. Normalize
        const normalizedTours = tours.map(tour => {
            // Safety check: If tour is null/undefined in the array
            if (!tour) return null;

            const durationValue = calculateDuration(tour.startDate, tour.endDate);

            return {
                id: tour._id || Math.random(), // Fallback ID
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
        }).filter(Boolean); // Remove any nulls generated above

        // 2. Filtering
        const filtered = normalizedTours.filter(tour => {
            if (tour.price > priceRange) return false;
            if (tourTypesFilter.length > 0 && !tourTypesFilter.includes(tour.type)) return false;
            if (durationFilter !== 'any') {
                const d = tour.durationValue;
                if (durationFilter === 'short' && (d < 1 || d > 3)) return false;
                if (durationFilter === 'medium' && (d < 4 || d > 7)) return false;
                if (durationFilter === 'long' && d <= 7) return false;
            }
            return true;
        });

        // 3. Sorting
        return filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'price') {
                comparison = a.price - b.price;
            } else if (sortBy === 'location') {
                comparison = a.location.localeCompare(b.location);
            } else if (sortBy === 'date') {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [tours, sortBy, sortOrder, priceRange, durationFilter, tourTypesFilter]);

    if (loading) return <div className="min-h-screen flex justify-center items-center text-indigo-600 font-bold">Loading...</div>;
    if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav cartCount={cartCount} />
            <Dashboard
                sortedTours={processedTours}
                totalToursCount={processedTours.length}
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
        </div>
    );
}

export default MainDash;