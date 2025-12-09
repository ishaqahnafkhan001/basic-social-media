import React from "react";
import { FiPlus, FiList, FiGrid, FiLogOut, FiX, FiLayout } from "react-icons/fi";

const NavLinks = ({ active, setActive, logout, close }) => {
    const items = [
        { id: "create", label: "Create Post", icon: <FiPlus /> },
        { id: "all", label: "All Posts", icon: <FiList /> },
        { id: "cats", label: "Categories", icon: <FiGrid /> },
    ];

    return (
        <div className="flex flex-col h-full">
            <ul className="space-y-1">
                {items.map((item) => (
                    <li
                        key={item.id}
                        onClick={() => { setActive(item.id); if (close) close(); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium cursor-pointer transition-all ${
                            active === item.id ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {item.icon} {item.label}
                    </li>
                ))}
            </ul>
            <button onClick={logout} className="mt-auto w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium">
                <FiLogOut /> Logout
            </button>
        </div>
    );
};

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }) {
    const logout = () => { localStorage.removeItem("accessToken"); window.location.href = "/auth"; };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r p-6 z-10">
                <div className="mb-10 flex items-center gap-2 text-blue-600">
                    <FiLayout size={28} />
                    <h1 className="text-2xl font-bold text-gray-900">TourDash</h1>
                </div>
                <NavLinks active={activeTab} setActive={setActiveTab} logout={logout} />
            </aside>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="absolute left-0 top-0 h-full w-64 bg-white p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold">Menu</h2>
                            <button onClick={onClose}><FiX size={24} /></button>
                        </div>
                        <NavLinks active={activeTab} setActive={setActiveTab} logout={logout} close={onClose} />
                    </div>
                </div>
            )}
        </>
    );
}