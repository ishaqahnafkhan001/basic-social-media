import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FiX, FiLock, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

// 🔴 REPLACE WITH YOUR STRIPE PUBLIC KEY
// You can find this in Stripe Dashboard > Developers > API Keys
const stripePromise = loadStripe(process.env.STRIPE_KEY);

// --- 2. THE INTERNAL FORM COMPONENT ---
const CheckoutForm = ({ onSuccess, onCancel, amount = 50 }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setProcessing(true);
        setErrorMessage(null);

        try {
            // Confirm the Payment (works for both one-time and subscriptions)
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // We use 'if_required' so it doesn't redirect unless 3D Secure is needed
                    // If you want a redirect flow, provide a valid return_url
                    return_url: window.location.origin + "/request",
                },
                redirect: 'if_required'
            });

            if (error) {
                // Show error to your customer (e.g., insufficient funds)
                setErrorMessage(error.message);
                toast.error(error.message);
                setProcessing(false);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                // Payment success!
                toast.success("Payment Successful!");
                onSuccess(paymentIntent.id);
            } else {
                // Unexpected state
                setProcessing(false);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("An unexpected error occurred.");
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* This renders the Credit Card / Google Pay / Apple Pay inputs */}
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                    {errorMessage}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                    {processing ? "Processing..." : <><FiLock /> Pay ${amount}</>}
                </button>
            </div>
        </form>
    );
};

// --- 1. THE MAIN MODAL WRAPPER ---
export default function VerificationPaymentModal({ isOpen, clientSecret, onClose, onSuccess }) {
    // Don't render if closed or missing the secret
    if (!isOpen || !clientSecret) return null;

    // Custom styling for the Stripe Inputs to match your Tailwind theme
    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#4f46e5', // Indigo-600
            colorBackground: '#ffffff',
            colorText: '#1e293b', // Slate-800
            borderRadius: '12px',
            fontFamily: '"Inter", sans-serif',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FiShield size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Secure Checkout</h3>
                            <p className="text-xs text-slate-500">Monthly Subscription</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Stripe Elements Wrapper */}
                <div className="p-6">
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm onSuccess={onSuccess} onCancel={onClose} amount={50} />
                    </Elements>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <FiLock size={10} />
                        Payments are 256-bit encrypted and secured by Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}