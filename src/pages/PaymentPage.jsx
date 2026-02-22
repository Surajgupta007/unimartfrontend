import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Copy, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [copying, setCopying] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isBuyer, setIsBuyer] = useState(false);
    const [sellerConfirmLoading, setSellerConfirmLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCurrentUser();
        fetchOrder();
    }, [token, orderId]);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentUserId(data._id || data.id);
                console.log('[DEBUG] Current user ID:', data._id || data.id);
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
        }
    };

    const fetchOrder = async () => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            console.log('[DEBUG] Order fetched:', data);
            setOrder(data);

            // Get seller details from first item (already populated)
            if (data.items && data.items.length > 0 && data.items[0].seller) {
                console.log('[DEBUG] Seller from order:', data.items[0].seller);
                setSeller({
                    id: data.items[0].seller._id,
                    name: data.items[0].seller.name,
                    email: data.items[0].seller.email,
                    upiNumber: data.items[0].seller.upiNumber
                });
            }
            setLoading(false);
        } catch (err) {
            console.error('[ERROR] Order fetch failed:', err);
            setError('Failed to load order');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (order && currentUserId) {
            // Check if current user is the buyer by comparing IDs as strings
            const isBuyerCheck = String(order.user) === String(currentUserId);
            console.log('[DEBUG] Buyer check - order.user:', order.user, 'currentUserId:', currentUserId, 'isBuyer:', isBuyerCheck);
            setIsBuyer(isBuyerCheck);
        }
    }, [order, currentUserId]);

    const copyToClipboard = (text) => {
        if (!text) {
            return;
        }
        navigator.clipboard.writeText(text);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    const handlePaymentConfirm = async () => {
        if (!paymentConfirmed) {
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}/confirm-payment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({})
            });

            const data = await res.json();
            if (res.ok) {
                navigate(`/order-confirmed/${orderId}`);
            } else {
                setError(data.msg || 'Failed to confirm payment');
            }
        } catch (err) {
            setError('Error confirming payment: ' + err.message);
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    {isBuyer ? 'Payment Details' : 'Order Status'}
                </h1>

                {error && (
                    <div className="mb-6 flex items-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* If user is a seller, show this message */}
                {!isBuyer && (
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                                    Waiting for Buyer Payment
                                </h2>
                                <p className="text-blue-800 dark:text-blue-300 mb-3">
                                    You are a seller in this order. The buyer will make the payment via UPI to your account. Once they confirm payment, you will be notified.
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    <strong>Meeting Location:</strong> {order.meetingLocation || 'To be confirmed'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Order Summary
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {order._id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {order.items?.length}
                                </span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                <span className="text-gray-900 dark:text-white">Total Amount:</span>
                                <span className="text-primary-600 dark:text-primary-400">
                                    ₹{order.totalAmount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Location */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Meeting Location
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            {order.meetingLocation || 'Location to be confirmed'}
                        </p>
                    </div>

                    {/* UPI Payment - Only for Buyer */}
                    {isBuyer && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Pay via UPI
                        </h2>

                        {seller?.upiNumber ? (
                            <div className="space-y-6">
                                {/* UPI Number */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Seller's UPI ID
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                                            {seller.upiNumber}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(seller.upiNumber)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                copying
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                                            }`}
                                        >
                                            {copying ? (
                                                <>
                                                    <Check className="h-4 w-4 inline mr-2" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 inline mr-2" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                                        Payment Instructions:
                                    </h3>
                                    <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                                        <li>Meet the seller at the specified location</li>
                                        <li>Inspect the product carefully</li>
                                        <li>Open your UPI app and send ₹{order.totalAmount} to {seller.upiNumber}</li>
                                        <li>Show the payment receipt to the seller</li>
                                        <li>Check the box below to confirm payment</li>
                                    </ol>
                                </div>

                                {/* Confirmation */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={paymentConfirmed}
                                            onChange={(e) => setPaymentConfirmed(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-primary-600 rounded"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            I have successfully paid ₹{order.totalAmount} to the seller via UPI and received confirmation. I have inspected the product and it matches the description.
                                        </span>
                                    </label>

                                    {paymentConfirmed && (
                                        <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-semibold">Ready to confirm</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handlePaymentConfirm}
                                    disabled={!paymentConfirmed}
                                    className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition ${
                                        paymentConfirmed
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Confirm Payment Complete
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    Seller has not provided UPI details yet
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Please contact the seller to complete the payment
                                </p>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Seller Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Seller Information
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {seller?.name || 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {seller?.email || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
