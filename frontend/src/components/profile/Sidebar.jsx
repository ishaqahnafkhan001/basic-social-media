import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Added new icons for the new menu items
import {
    FiPlus, FiList, FiLogOut, FiX, FiLayout, FiPieChart,
    FiSettings, FiMap, FiTag, FiCalendar, FiUsers, FiShield, FiFileText
} from "react-icons/fi";
import useUser from "../../hooks/userInfo.js";

// 1. Defined the Menu Structure per Role
// We use 'path: "#"' as a placeholder for now as requested.
const MENU_ROLES = {
    user: [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
        { id: "all-blog", label: "All Blog", icon: <FiList />, path: "/all-blogs" },
        { id: "myBlog", label: "My Blog", icon: <FiFileText />, path: "/blog" },
        { id: "settings", label: "Settings", icon: <FiSettings />, path: "#" },
    ],
    agency: [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
        { id: "all-blog", label: "All Blog", icon: <FiList />, path: "/all-blogs" },
        { id: "myBlog", label: "My Blog", icon: <FiFileText />, path: "/blog" },
        { id: "create", label: "Create Tour", icon: <FiPlus />, path: "#" },
        { id: "settings", label: "Settings", icon: <FiSettings />, path: "#" },
        { id: "tour-ongoing", label: "Tour On Going", icon: <FiMap />, path: "#" },
        { id: "add-offers", label: "Add Offers", icon: <FiTag />, path: "#" },
        { id: "booking", label: "Booking", icon: <FiCalendar />, path: "#" },
    ],
    admin: [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
        { id: "all-blog", label: "All Blog", icon: <FiList />, path: "/all-blogs" },
        { id: "myBlog", label: "My Blog", icon: <FiFileText />, path: "/blog" },
        { id: "create", label: "Create Tour", icon: <FiPlus />, path: "#" },
        { id: "settings", label: "Settings", icon: <FiSettings />, path: "#" },
        { id: "tour-ongoing", label: "Tour On Going", icon: <FiMap />, path: "#" },
        { id: "add-offers", label: "Add Offers", icon: <FiTag />, path: "#" },
        { id: "all-user", label: "All User", icon: <FiUsers />, path: "#" },
        { id: "booking", label: "Booking", icon: <FiCalendar />, path: "#" },
        { id: "verification", label: "Verification", icon: <FiShield />, path: "#" },
    ],
};

const NavItem = ({ item, active, onClick }) => {
    const isActive = active === item.id;

    // Common styling classes
    const className = `relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium cursor-pointer transition-colors z-10 ${
        isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
    }`;

    // The inner content
    const content = (
        <>
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className="text-xl relative z-20">{item.icon}</span>
            <span className="relative z-20">{item.label}</span>
        </>
    );

    return (
        <li>
            {/* Always use Link now, defaulting to '#' if no path provided */}
            <Link to={item.path || "#"} onClick={onClick} className={className}>
                {content}
            </Link>
        </li>
    );
};

const NavLinks = ({ active, setActive, logout, close, role }) => {
    // 2. Select items based on role, default to 'user' if role not found
    const items = MENU_ROLES[role] || MENU_ROLES["user"];

    return (
        <div className="flex flex-col h-full">
            {/* Scrollable area for menu items if the list gets too long */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                <ul className="space-y-1">
                    {items.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            active={active}
                            onClick={() => { setActive(item.id); if (close) close(); }}
                        />
                    ))}
                </ul>
            </div>

            {/* Logout Button */}
            <div className="border-t border-slate-100 pt-4 mt-2">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-medium transition-all duration-200 group"
                >
                    <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }) {
    const logout = () => { localStorage.removeItem("accessToken"); window.location.href = "/auth"; };

    // 3. Get userName and ROLE from your hook
    // Ensure your useUser hook returns a 'role' property (e.g., "admin", "agency", "user")
    const { userName, role } = useUser() || { userName: "User", role: "user" };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-80px)] sticky top-[80px] bg-white border-r border-slate-200 p-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-30">
                <div className="mb-6 pl-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {userName}'s Panel
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                            {role}
                        </span>
                    </p>
                </div>
                {/* Pass role to NavLinks */}
                <NavLinks active={activeTab} setActive={setActiveTab} logout={logout} role={role} />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                <div className={`absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <FiLayout size={24} />
                            <h2 className="text-xl font-bold text-slate-900">TourDash</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><FiX size={20} /></button>
                    </div>
                    {/* Pass role to NavLinks */}
                    <NavLinks active={activeTab} setActive={setActiveTab} logout={logout} close={onClose} role={role} />
                </div>
            </div>
        </>
    );
}