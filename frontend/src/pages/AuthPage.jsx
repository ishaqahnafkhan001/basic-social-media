import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import userApi from "../api/authApi"; // your API module
import { useNavigate } from "react-router-dom";


export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const [form, setForm] = useState({ name: "", email: "", password: "" });

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
                });

                toast.success("Account created successfully!");
                setIsSignup(false); // go to login screen
            } else {
                // LOGIN
                res = await userApi.login({
                    email: form.email,
                    password: form.password,
                });

                toast.success("Logged in successfully!");

                localStorage.setItem("accessToken", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

// Redirect using React Router
                navigate("/dashboard");

                // Save token
                localStorage.setItem("accessToken", res.data.token || res.data.accessToken);

                // Optional: redirect
                // window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Something went wrong!");
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-tr from-black/60 to-gray-900/60 border border-gray-800 shadow-lg rounded-2xl p-6 md:p-10"
            >
                {/* ---------- LEFT SIDE ---------- */}
                <div className="hidden md:flex flex-col justify-center items-start gap-4 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-black font-bold">
                            A
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold">Aurora</h1>
                            <p className="text-sm text-gray-400">Secure access, beautifully designed.</p>
                        </div>
                    </div>

                    <div className="mt-6 text-left">
                        <h2 className="text-3xl font-bold leading-tight">Welcome back</h2>
                        <p className="mt-2 text-gray-400">Sign in or create your new account.</p>
                    </div>

                    <ul className="mt-6 space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                            Encrypted security
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                            Fast authentication
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                            Protected dashboard
                        </li>
                    </ul>
                </div>

                {/* ---------- RIGHT SIDE FORM ---------- */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">
                            {isSignup ? "Create account" : "Sign in to your account"}
                        </h3>

                        <button
                            onClick={() => setIsSignup((s) => !s)}
                            className="text-sm text-indigo-300 hover:text-indigo-200"
                        >
                            {isSignup ? "Already have an account?" : "Don’t have an account?"}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignup && (
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Full name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Your name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={loading}
                            type="submit"
                            className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-pink-500 text-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : isSignup ? "Create account" : "Sign in"}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
