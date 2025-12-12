import React, { useState } from 'react';
import { ShoppingCart, MapPin, Menu, X, User } from 'lucide-react';
import { Link } from "react-router-dom";
import useUser from "../../hooks/userInfo.js"
function Nav({ cartCount }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userRole = useUser().role;
    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Common link styles to keep code DRY
    const linkStyles = "text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all duration-200";
    const activeLinkStyles = "text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg";

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* 1. Logo Section */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                            WanderGo
                        </span>
                    </div>

                    {/* 2. Desktop Navigation - Hidden on Mobile */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link to="/dashboard" className={activeLinkStyles}>Home</Link>

                        {/* Conditional Agency Link */}
                        {(userRole === 'admin' || userRole === 'agency') && (
                            <Link to="/create-tour" className={linkStyles}>Agency</Link>
                        )}

                        <Link to="/EmergencyHub" className={linkStyles}>Emergency Hub</Link>
                        <Link to="/profile" className={linkStyles}>Profile</Link>
                        <Link to="/all-blogs" className={linkStyles}>Blog</Link>
                    </div>

                    {/* 3. Right Side Icons (Cart & Profile) */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Cart Button */}
                        <button
                            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
                            title="View Cart"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Profile Avatar (Desktop) */}
                        <Link to="/profile" className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-medium text-sm shadow-md ring-2 ring-white cursor-pointer hover:shadow-lg transition-all">
                            {useUser().initials}
                        </Link>

                        {/* Mobile Menu Button */}
                        <div className="flex lg:hidden">
                            <button
                                onClick={toggleMenu}
                                className="p-2 inline-flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-5 duration-200">
                    <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
                        <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50" onClick={toggleMenu}>
                            Home
                        </Link>

                        {(userRole === 'admin' || userRole === 'agency') && (
                            <Link to="/create-tour" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50" onClick={toggleMenu}>
                                Agency Panel
                            </Link>
                        )}

                        <Link to="/EmergencyHub" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50" onClick={toggleMenu}>
                            Emergency Hub
                        </Link>

                        <Link to="/all-blogs" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50" onClick={toggleMenu}>
                            Blog
                        </Link>

                        {/* Mobile Profile Link */}
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 mt-4 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 border-t border-slate-100 pt-4" onClick={toggleMenu}>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User className="w-4 h-4" />
                            </div>
                            Your Profile
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Nav;