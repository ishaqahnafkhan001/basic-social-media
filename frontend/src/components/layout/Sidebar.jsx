import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiPlus, FiList, FiLogOut, FiX, FiLayout, FiPieChart,
    FiSettings, FiMap, FiTag, FiCalendar, FiUsers, FiShield, FiFileText,FiBookOpen,FiClipboard
} from "react-icons/fi";
import { MdOutlineTour } from "react-icons/md";
import useUser from "../../hooks/userInfo.js";

// --- Configuration ---
const MENU_ROLES = {
    user: [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
        { id: "all-blog", label: "All Blog", icon: <FiList />, path: "/blog/all-blogs" },
        { id: "myBlog", label: "My Blog", icon: <FiFileText />, path: "/blog/myBlogs" },
        { id: "create", label: "Create blog", icon: <FiPlus />, path: "/create-blog" },
        { id: "settings", label: "Settings", icon: <FiSettings />, path: "#" },
        { id: "booking", label: "Booking", icon: <FiBookOpen />, path: "#" },

    ],
    agency: [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
        { id: "all-blog", label: "All Blog", icon: <FiList />, path: "/blog/all-blogs" },
        { id: "myBlog", label: "My Blog", icon: <FiFileText />, path: "/blog/myBlogs" },
        { id: "create", label: "Create blog", icon: <FiPlus />, path: "/create-blog" },
        { id: "create-tour", label: "Create Tour", icon: <MdOutlineTour />, path: "/create-tour" },
        { id: "tour-ongoing", label: "Tour On Going", icon: <FiMap />, path: "/tours/my-tours" },
        { id: "add-offers", label: "Add Offers", icon: <FiTag />, path: "#" },
        { id: "booking", label: "Booking", icon: <FiCalendar />, path: "#" },
        { id: "settings", label: "Settings", icon: <FiSettings />, path: "#" },
        { id: "order", label: "Order", icon: <FiSettings />, path: "#" },


    ],
    admin: [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
        { id: "all-blog", label: "All Blog", icon: <FiList />, path: "/blog/all-blogs" },
        { id: "myBlog", label: "My Blog", icon: <FiFileText />, path: "/blog/myBlogs" },
        { id: "create", label: "Create blog", icon: <FiPlus />, path: "/create-blog" },
        { id: "create-tour", label: "Create Tour", icon: <FiPlus />, path: "#" },
        { id: "tour-ongoing", label: "Tour On Going", icon: <FiMap />, path: "#" },
        { id: "add-offers", label: "Add Offers", icon: <FiTag />, path: "#" },
        { id: "all-user", label: "All User", icon: <FiUsers />, path: "#" },
        { id: "booking", label: "Booking", icon: <FiCalendar />, path: "#" },
        { id: "verification", label: "Verification", icon: <FiShield />, path: "#" },
        { id: "settings", label: "Settings", icon: <FiSettings />, path: "#" },
    ],
};

// --- Sub-Components ---
const NavItem = ({ item, activeId, onClick }) => {
    const isActive = activeId === item.id;

    const handleClick = (e) => {
        if (item.path === "#") e.preventDefault();
        onClick(item.id);
    };

    return (
        <li>
            <Link
                to={item.path}
                onClick={handleClick}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium cursor-pointer transition-colors z-10 
        ${isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <span className="text-xl relative z-20">{item.icon}</span>
                <span className="relative z-20">{item.label}</span>
            </Link>
        </li>
    );
};

// --- Main Component ---
export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }) {
    const location = useLocation();
    const userData = useUser();

    // Safe defaults if user data isn't loaded yet
    const userName = userData?.userName || "User";
    const role = userData?.role || "user";

    const logout = () => {
        localStorage.removeItem("accessToken");
        window.location.href = "/auth";
    };

    // Get menu items based on role, fallback to 'user' if role invalid
    const menuItems = MENU_ROLES[role] || MENU_ROLES["user"];

    // AUTO-HIGHLIGHT: Sync active tab with current URL path on page load/navigation
    useEffect(() => {
        const currentPath = location.pathname;
        // Find the item that matches the current path
        const activeItem = menuItems.find(item => item.path === currentPath);
        if (activeItem) {
            setActiveTab(activeItem.id);
        }
    }, [location.pathname, role, setActiveTab]);

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            {/* Sticky positioning requires the parent to allow scrolling.
          Ideally, your layout is: <div className="flex"> <Sidebar /> <MainContent /> </div>
      */}
            <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-80px)] sticky top-[80px] bg-white border-r border-slate-200 p-6 z-30 overflow-hidden">

                {/* User Header */}
                <div className="mb-6 pl-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {userName}'s Panel
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
              {role}
            </span>
                    </p>
                </div>

                {/* Navigation List */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                activeId={activeTab}
                                onClick={setActiveTab}
                            />
                        ))}
                    </ul>
                </div>

                {/* Logout Footer */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-medium transition-all duration-200 group"
                    >
                        <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* --- MOBILE SIDEBAR --- */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Backdrop - Clicks here close the menu */}
                <div
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                {/* Sidebar Drawer */}
                <div
                    className={`absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-2xl transition-transform duration-300 transform ${
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    {/* Mobile Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <FiLayout size={24} />
                            <h2 className="text-xl font-bold text-slate-900">TourDash</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Mobile Navigation List */}
                    <div className="flex flex-col h-[calc(100%-80px)]">
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <ul className="space-y-1">
                                {menuItems.map((item) => (
                                    <NavItem
                                        key={item.id}
                                        item={item}
                                        activeId={activeTab}
                                        onClick={(id) => {
                                            setActiveTab(id);
                                            onClose(); // Close menu on selection
                                        }}
                                    />
                                ))}
                            </ul>
                        </div>

                        {/* Mobile Logout */}
                        <div className="border-t border-slate-100 pt-4 mt-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-medium"
                            >
                                <FiLogOut />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}