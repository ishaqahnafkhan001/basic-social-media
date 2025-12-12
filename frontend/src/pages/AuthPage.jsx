import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import userApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi"; // Optional: Added for visual polish in list

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user"
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            let res;
            if (isSignup) {
                // SIGNUP
                res = await userApi.register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                });
                toast.success("Account created successfully!");
                setIsSignup(false);
            } else {
                // LOGIN
                res = await userApi.login({
                    email: form.email,
                    password: form.password,
                });
                toast.success("Logged in successfully!");
                localStorage.setItem("accessToken", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Something went wrong!");
        }
        setLoading(false);
    }

    return (
        // 1. Background changed to Slate-50 to match Dashboard
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                // 2. Card container: White background, clean shadow, rounded-2xl
                className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-100"
            >
                {/* ---------- LEFT SIDE (Brand) ---------- */}
                {/* Changed to Indigo Gradient to match the primary button color of dashboard */}
                <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-xl">
                            A
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Aurora Tours</h1>
                    </div>

                    <div className="my-auto">
                        <h2 className="text-3xl font-bold leading-tight mb-4">
                            Start your <br /> next adventure.
                        </h2>
                        <p className="text-indigo-100 leading-relaxed">
                            Join thousands of travelers and agencies managing their tours with ease and style.
                        </p>
                    </div>

                    <ul className="space-y-3 text-sm font-medium text-indigo-100">
                        <li className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><FiCheck size={14} /></span>
                            Create stunning tour blogs
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><FiCheck size={14} /></span>
                            Connect with travelers
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><FiCheck size={14} /></span>
                            Manage bookings easily
                        </li>
                    </ul>
                </div>

                {/* ---------- RIGHT SIDE (Form) ---------- */}
                <div className="flex flex-col justify-center p-8 md:p-12 bg-white">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            {isSignup ? "Create an account" : "Welcome back"}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            {isSignup ? "Enter your details below to create your account" : "Please enter your details to sign in"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignup && (
                            <>
                                {/* Role Selection - Styled to match dashboard inputs */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">I am a:</label>
                                    <div className="flex gap-3">
                                        {['user', 'agency'].map((roleType) => (
                                            <label
                                                key={roleType}
                                                className={`cursor-pointer flex-1 py-2.5 text-center rounded-lg border text-sm font-medium transition-all ${
                                                    form.role === roleType
                                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={roleType}
                                                    checked={form.role === roleType}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit"
                            className="w-full py-2.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
                        >
                            {loading ? "Processing..." : isSignup ? "Create account" : "Sign in"}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        {isSignup ? "Already have an account? " : "Don’t have an account? "}
                        <button
                            onClick={() => setIsSignup((s) => !s)}
                            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                        >
                            {isSignup ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}