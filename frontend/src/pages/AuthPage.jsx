import React, { useState } from "react";
import { motion } from "framer-motion";

// AuthPage.jsx
// Single-file React component (default export) for a dark/back-themed
// Login / Sign Up page using Tailwind CSS and Framer Motion for subtle animation.

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        // Placeholder: replace with real submit logic (API call / validation)
        console.log(isSignup ? "Sign Up" : "Log In", form);
        alert((isSignup ? "Sign Up" : "Log In") + " submitted (check console)");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-tr from-black/60 to-gray-900/60 border border-gray-800 shadow-lg rounded-2xl p-6 md:p-10"
            >
                {/* Left side: Branding / Promo */}
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
                        <p className="mt-2 text-gray-400">Sign in to continue to your dashboard or create a new account.</p>
                    </div>

                    <ul className="mt-6 space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                            Encrypted sessions
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                            Two-factor ready
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                            Fast & lightweight
                        </li>
                    </ul>

                    <p className="mt-auto text-sm text-gray-500">By continuing you agree to our Terms and Privacy.</p>
                </div>

                {/* Right side: Form */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">{isSignup ? "Create account" : "Sign in to your account"}</h3>
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
                                    required={isSignup}
                                    className="w-full rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                                className="w-full rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                                className="w-full rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-black/30" />
                                Remember me
                            </label>

                            <a href="#" className="hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-pink-500 text-black shadow-md"
                        >
                            {isSignup ? "Create account" : "Sign in"}
                        </motion.button>

                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <hr className="flex-1 border-gray-700" />
                            <span>or continue with</span>
                            <hr className="flex-1 border-gray-700" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button type="button" className="py-2 rounded-lg border border-gray-700 bg-black/20 text-sm">Google</button>
                            <button type="button" className="py-2 rounded-lg border border-gray-700 bg-black/20 text-sm">GitHub</button>
                            <button type="button" className="py-2 rounded-lg border border-gray-700 bg-black/20 text-sm">Twitter</button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                            By continuing you agree to our <a href="#" className="text-indigo-300 underline">Terms</a> and <a href="#" className="text-indigo-300 underline">Privacy</a>.
                        </p>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <button
                            onClick={() => setIsSignup((s) => !s)}
                            className="underline text-indigo-300"
                        >
                            {isSignup ? "Already have an account? Sign in" : "Create new account"}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Small helper: Keyboard accessibility hint */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Press Tab to navigate • Secure dark theme</div>
        </div>
    );
}
