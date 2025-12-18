import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiShield, FiUploadCloud, FiCheckCircle, FiAlertCircle, FiCreditCard,
    FiUser, FiMail, FiX, FiPhone, FiMapPin, FiGlobe, FiChevronDown
} from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast';

// API & Hooks
import userApi from "../api/userApi";
import requestApi from "../api/requestApi"; // 🟢 IMPORT REQUEST API
import useUser from "../hooks/userInfo";
import Nav from "../components/nav/Nav";

// Data
import { countryCodes } from "../../utils/countryCodes.js";
import { countries } from "../../utils/countries.jsx";

// Components
import VerificationPaymentModal from "../components/payment/VerificationPaymentModal";

export default function Request() {
    const navigate = useNavigate();
    const { user, isLoggedIn, isLoading } = useUser();

    // --- STATES ---
    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStatus, setCurrentStatus] = useState("unverified");

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [subscriptionId, setSubscriptionId] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        phoneCode: "+880",
        phoneNumber: "",
        city: "",
        country: "",
        documentType: "nid",
        documentNumber: "",
    });

    // File State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // --- 1. LOAD USER DATA ---
    useEffect(() => {
        if (isLoading) return;
        if (!isLoggedIn) { navigate("/auth"); return; }
        if (!user) return;

        const fetchUserData = async () => {
            try {
                // We still use userApi to get CURRENT profile info to pre-fill
                const res = await userApi.getById(user.id);
                const userData = res.data;

                setCurrentStatus(userData.verificationData?.status || "unverified");

                setFormData({
                    phoneCode: "+880",
                    phoneNumber: userData.phoneNumber || "",
                    city: userData.address?.city || "",
                    country: userData.address?.country || "",
                    documentType: userData.verificationData?.documentType || "nid",
                    documentNumber: userData.verificationData?.documentNumber || "",
                });

            } catch (err) {
                console.error(err);
                toast.error("Failed to load user data");
            } finally {
                setPageLoading(false);
            }
        };

        fetchUserData();
    }, [isLoggedIn, isLoading, navigate, user]);

    // --- HANDLERS ---
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- 2. START SUBSCRIPTION (Open Modal) ---
    const handleInitialSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phoneNumber) return toast.error("Phone number is required");
        if (!formData.city) return toast.error("City is required");
        if (!formData.country) return toast.error("Country is required");
        if (!formData.documentNumber) return toast.error("Document number is required");
        if (!selectedFile && currentStatus === 'unverified') return toast.error("Please upload a document image");

        const loadingToast = toast.loading("Setting up monthly subscription...");

        try {
            // 🟢 USING REQUEST API
            const { data } = await requestApi.createSubscription();

            setClientSecret(data.clientSecret);
            setSubscriptionId(data.subscriptionId);

            toast.dismiss(loadingToast);
            setIsPaymentOpen(true);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Could not initialize payment. Please try again.");
            console.error(error);
        }
    };

    // --- 3. ON PAYMENT SUCCESS (Submit Data) ---
    const handlePaymentSuccess = async (paymentId) => {
        setIsPaymentOpen(false);
        setSubmitting(true);

        const loadingToast = toast.loading("Payment successful! Uploading documents...");

        try {
            const payload = new FormData();

            // A. Contact Info
            const fullPhone = `${formData.phoneCode} ${formData.phoneNumber}`;
            payload.append("phoneNumber", fullPhone);

            const addressData = { city: formData.city, country: formData.country };
            payload.append("address", JSON.stringify(addressData));

            // B. Verification & Subscription Data
            const verificationData = {
                status: 'pending',
                documentType: formData.documentType,
                documentNumber: formData.documentNumber,
                stripeSubscriptionId: subscriptionId,
                // Set initial expiry to 30 days
                subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            };
            payload.append("verificationData", JSON.stringify(verificationData));

            // C. File
            if (selectedFile) {
                // Ensure backend expects 'profilePicture' (or 'documentImage')
                payload.append("profilePicture", selectedFile);
            }

            // 🟢 USING REQUEST API
            // This sends to POST /api/requests
            await requestApi.create(payload);

            toast.dismiss(loadingToast);
            toast.success("Request submitted successfully!");
            setCurrentStatus("pending");

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Payment succeeded, but data save failed. Please contact support.");
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

    // --- STATUS SCREENS ---

    if (currentStatus === "verified") {
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
                <Nav />
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-green-100 max-w-md mx-4">
                    <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-slate-800">You are Verified!</h2>
                    <p className="text-slate-500 mt-2 mb-6">You have full access to partner features.</p>
                    <button onClick={() => navigate(`/profile/${user.id}`)} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 w-full">Go to Profile</button>
                </div>
            </div>
        )
    }

    if (currentStatus === "pending") {
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
                <Nav />
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-amber-100 max-w-md mx-4">
                    <FiAlertCircle className="text-6xl text-amber-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-slate-800">Verification Pending</h2>
                    <p className="text-slate-500 mt-2 mb-6">We are reviewing your documents. Check back within 24 hours.</p>
                    <button onClick={() => navigate(`/`)} className="text-indigo-600 font-bold hover:underline">Back Home</button>
                </div>
            </div>
        )
    }

    // --- MAIN FORM ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav />
            <Toaster position="top-center" />

            {/* PAYMENT MODAL */}
            <VerificationPaymentModal
                isOpen={isPaymentOpen}
                clientSecret={clientSecret}
                onClose={() => setIsPaymentOpen(false)}
                onSuccess={handlePaymentSuccess}
            />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
                        <FiShield className="text-indigo-600" /> Verify Your Identity
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                        Update your contact details, upload a valid ID, and subscribe to become a verified partner.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left: User Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><FiUser /></div>
                                    <div><p className="text-xs text-slate-400 font-bold uppercase">Name</p><p className="text-sm font-semibold text-slate-800">{user.name}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><FiMail /></div>
                                    <div><p className="text-xs text-slate-400 font-bold uppercase">Email</p><p className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{user.email}</p></div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed border border-blue-100">
                                    <strong>Note:</strong> Ensure your profile details match the ID card you upload.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleInitialSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">

                            {/* SECTION 1: CONTACT */}
                            <div className="mb-8 border-b border-slate-100 pb-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                                    Contact Details
                                </h3>
                                <div className="space-y-4">

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                        <div className="flex gap-2">
                                            <div className="relative w-32 shrink-0">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500"><FiGlobe /></div>
                                                <select name="phoneCode" value={formData.phoneCode} onChange={handleChange} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium appearance-none cursor-pointer">
                                                    {countryCodes.map((item) => (<option key={item.code} value={item.code}>{item.code} ({item.country})</option>))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400"><FiChevronDown /></div>
                                            </div>
                                            <div className="relative flex-1">
                                                <FiPhone className="absolute left-4 top-3.5 text-slate-400" />
                                                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="1712 345 678" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                            <div className="relative">
                                                <FiMapPin className="absolute left-4 top-3.5 text-slate-400" />
                                                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Dhaka" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium transition-all" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                                            <div className="relative">
                                                <FiGlobe className="absolute left-4 top-3.5 text-slate-400" />
                                                <select name="country" value={formData.country} onChange={handleChange} className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium appearance-none cursor-pointer transition-all">
                                                    <option value="" disabled>Select Country</option>
                                                    {countries.map((c) => (<option key={c} value={c}>{c}</option>))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400"><FiChevronDown /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: DOCUMENTS */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                                    Identity Document
                                </h3>

                                {/* Doc Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Document Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['nid', 'passport', 'other'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({...formData, documentType: type})}
                                                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold capitalize transition-all ${formData.documentType === type ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Doc Number */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Document Number</label>
                                    <div className="relative">
                                        <FiCreditCard className="absolute left-4 top-3.5 text-slate-400" />
                                        <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} placeholder="e.g. 1234 5678 9000" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium transition-all" />
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Document Image</label>
                                    {!previewUrl ? (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FiUploadCloud className="w-10 h-10 mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                <p className="mb-2 text-sm text-slate-500"><span className="font-bold text-slate-700">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-slate-400">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    ) : (
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                                            <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="bg-white text-rose-500 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-rose-50 transition"><FiX /> Remove</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? "Processing..." : <><FiShield /> Subscribe ($50/mo) & Verify</>}
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-4">
                                This is a recurring monthly subscription of $50. You can cancel anytime.
                            </p>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}