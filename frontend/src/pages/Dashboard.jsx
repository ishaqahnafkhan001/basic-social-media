import React, { useState, useCallback, useMemo } from 'react';
import Nav from '../components/nav/Nav.jsx';         // Assuming Nav.jsx is defined elsewhere
import Dashboard from '../components/dashboard/Dashboard.jsx'; // Assuming Dashboard.jsx is defined elsewhere

// Demo tours data - kept in the root for central state management
const initialTours = [
    {
        id: 1,
        title: 'Paris Adventure: Eiffel Tower & Louvre',
        location: 'Paris, France',
        price: 1200,
        date: '2024-06-15',
        imageUrl: 'https://placehold.co/400x250/2563EB/FFFFFF?text=Paris+Adventure',
        rating: 4.5,
        duration: '5 days',
        type: 'Cultural'
    },
    {
        id: 2,
        title: 'Tokyo Explorer: Shrines and Neon Cityscapes',
        location: 'Tokyo, Japan',
        price: 1500,
        date: '2024-07-01',
        imageUrl: 'https://placehold.co/400x250/F59E0B/FFFFFF?text=Tokyo+Explorer',
        rating: 4.8,
        duration: '7 days',
        type: 'Adventure'
    },
    {
        id: 3,
        title: 'Bali Retreat: Sun, Sand, and Yoga',
        location: 'Bali, Indonesia',
        price: 900,
        date: '2024-05-20',
        imageUrl: 'https://placehold.co/400x250/10B981/FFFFFF?text=Bali+Retreat',
        rating: 4.6,
        duration: '6 days',
        type: 'Beach'
    },
    {
        id: 4,
        title: 'New York City: Broadway & Central Park',
        location: 'NYC, USA',
        price: 1800,
        date: '2024-09-10',
        imageUrl: 'https://placehold.co/400x250/DC2626/FFFFFF?text=NYC+Lights',
        rating: 4.7,
        duration: '3 days',
        type: 'Cultural'
    },
    {
        id: 5,
        title: 'Swiss Alps Hiking: Majestic Views',
        location: 'Swiss Alps, Switzerland',
        price: 2200,
        date: '2024-08-01',
        imageUrl: 'https://placehold.co/400x250/06B6D4/FFFFFF?text=Swiss+Hike',
        rating: 4.9,
        duration: '10 days',
        type: 'Adventure'
    },
    {
        id: 6,
        title: 'Caribbean Dive Trip',
        location: 'Grand Cayman',
        price: 1100,
        date: '2024-11-05',
        imageUrl: 'https://placehold.co/400x250/0F766E/FFFFFF?text=Dive+Trip',
        rating: 4.4,
        duration: '4 days',
        type: 'Beach'
    },
    {
        id: 7,
        title: 'Amazon River Expedition',
        location: 'Manaus, Brazil',
        price: 2800,
        date: '2024-10-20',
        imageUrl: 'https://placehold.co/400x250/84CC16/FFFFFF?text=Amazon+Expedition',
        rating: 4.7,
        duration: '14 days',
        type: 'Adventure'
    },
];

// Helper function to parse duration string to number of days
const parseDuration = (durationStr) => {
    const match = durationStr.match(/(\d+)\s*days/i);
    return match ? parseInt(match[1], 10) : 0;
};

function MainDash() {
    // --- Global State ---
    const [tours] = useState(initialTours);
    const [cartCount, setCartCount] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Sorting State ---
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');

    // --- Filtering State (New) ---
    const [priceRange, setPriceRange] = useState(3000); // Max price
    const [durationFilter, setDurationFilter] = useState('any');
    const [tourTypesFilter, setTourTypesFilter] = useState([]); // Default to empty array

    // --- Callbacks ---
    const handleAddToCart = useCallback(() => {
        setCartCount(prev => prev + 1);
        console.log("Tour added to cart.");
    }, []);

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    const handleMobileFilterToggle = useCallback(() => {
        setIsMobileFilterOpen(prev => !prev);
    }, []);

    // --- Combined Filtering and Sorting Logic ---
    const filteredAndSortedTours = useMemo(() => {
        // 1. Filtering
        const filteredTours = tours.filter(tour => {

            // Filter by Price
            if (tour.price > priceRange) {
                return false;
            }

            // Filter by Tour Type
            if (tourTypesFilter.length > 0 && !tourTypesFilter.includes(tour.type)) {
                return false;
            }

            // Filter by Duration
            if (durationFilter !== 'any') {
                const tourDuration = parseDuration(tour.duration);
                let durationCheck = false;

                if (durationFilter === 'short' && tourDuration >= 1 && tourDuration <= 3) {
                    durationCheck = true;
                } else if (durationFilter === 'medium' && tourDuration >= 4 && tourDuration <= 7) {
                    durationCheck = true;
                } else if (durationFilter === 'long' && tourDuration > 7) {
                    durationCheck = true;
                }

                if (!durationCheck) return false;
            }

            return true;
        });

        // 2. Sorting
        return filteredTours.sort((a, b) => {
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav cartCount={cartCount} />
            <Dashboard
                // Tour Data
                sortedTours={filteredAndSortedTours}
                totalToursCount={filteredAndSortedTours.length} // Count of *filtered* tours

                // Sorting Props
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                handleSortOrderToggle={handleSortOrderToggle}

                // Filtering Props (New)
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                duration={durationFilter}
                setDuration={setDurationFilter}
                tourTypes={tourTypesFilter}
                setTourTypes={setTourTypesFilter}

                // Action Handlers
                handleAddToCart={handleAddToCart}
            />
        </div>
    );
}

export default MainDash;