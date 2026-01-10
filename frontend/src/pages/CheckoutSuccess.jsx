import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi'; // Ensure you add verifyPayment to your API file

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('verifying');

    useEffect(() => {
        const verify = async () => {
            if (!sessionId) return;
            try {
                // Call the backend to verify payment status
                await bookingApi.verifyPayment(sessionId);
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };
        verify();
    }, [sessionId]);

    if (status === 'verifying') return <div>Verifying Payment...</div>;

    if (status === 'error') return <div>Payment Verification Failed. Contact Support.</div>;

    return (
        <div className="text-center mt-20">
            <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
            <p>Your booking has been confirmed.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-5 bg-indigo-600 text-white px-6 py-2 rounded">
                Go to My Bookings
            </button>
        </div>
    );
};

export default CheckoutSuccess;