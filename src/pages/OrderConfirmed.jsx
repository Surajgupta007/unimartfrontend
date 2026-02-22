import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Clock, AlertCircle } from 'lucide-react';

export default function OrderConfirmed() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrder();
    }, [token, orderId]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load order');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!order) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 text-lg">Order not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Success Banner */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-24 w-24 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Your booking has been confirmed and the seller has been notified.
                    </p>
                </div>

                {/* Order Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            What's Next?
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Seller Confirmation</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        The seller will review your booking and confirm the meeting location within a few hours.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Meet the Seller</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Meet at the confirmed location on the LPU campus to inspect the product.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Quick Payment</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Once you approve the product condition, pay the seller directly via their UPI ID.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {order._id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{order.items?.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                                    ₹{order.totalAmount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Location */}
                    {order.meetingLocation && order.meetingLocation !== 'To be confirmed by seller' && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary-600" />
                                Meeting Location
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                {order.meetingLocation}
                            </p>
                        </div>
                    )}

                    {(!order.meetingLocation || order.meetingLocation === 'To be confirmed by seller') && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Awaiting Location Confirmation
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm">
                                The seller will confirm the exact meeting location on campus shortly. Check your notifications for updates!
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        View Notifications
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                    >
                        View All Orders
                    </button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Pro Tip:</strong> Check your notifications regularly for seller confirmations and product details. Make sure your UPI app is ready for quick payment when you meet the seller.
                    </p>
                </div>
            </div>
        </div>
    );
}
