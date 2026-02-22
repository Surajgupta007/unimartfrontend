import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Mail, CheckCircle, AlertCircle, Phone, Users } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function MeetingConfirmation() {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyerConfirmed, setBuyerConfirmed] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const orderData = sessionStorage.getItem('pendingOrder');
        if (orderData) {
            setOrder(JSON.parse(orderData));
            setLoading(false);
        } else {
            setError('No order to confirm');
            setLoading(false);
        }
    }, []);

    const handleConfirmMeeting = async () => {
        if (!buyerConfirmed) {
            setError('Please confirm that you agree to meet');
            return;
        }

        setLoading(true);
        try {
            // Get meetingLocation from order (it should be there)
            const meetingLocation = order.meetingLocation;
            
            if (!meetingLocation) {
                throw new Error('Meeting location not found in order');
            }

            // Create the order with confirmed meeting
            const response = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    items: order.items,
                    totalAmount: order.totalAmount,
                    meetingLocation: meetingLocation,
                    buyerConfirmed: true,
                    status: 'meeting_scheduled'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to create order');
            }

            sessionStorage.removeItem('pendingOrder');
            navigate(`/checkout/${data._id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error && !order) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 text-lg">{error}</p>
                    <button
                        onClick={() => navigate('/cart')}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Confirm Meeting Details
                </h1>

                {error && (
                    <div className="mb-6 flex items-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {order && (
                    <div className="space-y-6">
                        {/* Items to Exchange */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Items to Exchange
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                        <img
                                            src={getImageUrl(item.product?.images?.[0] || '')}
                                            alt={item.product?.title}
                                            className="w-20 h-20 object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {item.product?.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Quantity: {item.quantity} × ₹{item.price}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Total: ₹{item.quantity * item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Meeting Location */}
                        <div className={`rounded-lg p-6 ${
                            order.meetingLocation === 'To be confirmed by seller'
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        }`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className={`h-5 w-5 ${
                                    order.meetingLocation === 'To be confirmed by seller'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                }`} />
                                Meeting Location
                            </h2>
                            <p className={`text-lg font-semibold mb-2 ${
                                order.meetingLocation === 'To be confirmed by seller'
                                    ? 'text-yellow-800 dark:text-yellow-200'
                                    : 'text-gray-900 dark:text-white'
                            }`}>
                                {order.meetingLocation || order.items[0]?.product?.meetingLocation}
                            </p>
                            {order.meetingLocation === 'To be confirmed by seller' && (
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    The seller will confirm the exact meeting location after you both agree. Please check your notifications or contact the seller for details.
                                </p>
                            )}
                            {order.meetingLocation !== 'To be confirmed by seller' && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You and the seller will meet at this location on LPU campus to exchange the product
                                </p>
                            )}
                        </div>

                        {/* Seller Contact */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Contact Seller
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Seller Name</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {order.items[0]?.seller?.name || 'Not available'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {order.items[0]?.seller?.email || 'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Meeting Confirmation
                            </h2>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={buyerConfirmed}
                                        onChange={(e) => setBuyerConfirmed(e.target.checked)}
                                        className="mt-1 w-5 h-5 text-primary-600 rounded"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        I confirm that I will meet the seller at the specified location on LPU campus and inspect the product before payment. I understand the product must be in the condition described.
                                    </span>
                                </label>

                                {buyerConfirmed && (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-semibold">Meeting confirmed!</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Back to Cart
                                </button>
                                <button
                                    onClick={handleConfirmMeeting}
                                    disabled={!buyerConfirmed || loading}
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition ${
                                        buyerConfirmed
                                            ? 'bg-primary-600 hover:bg-primary-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                <strong>Important:</strong> After confirming this meeting, you will proceed to payment. Only pay after you have inspected and confirmed that the product matches the description. Please note the seller's contact details to coordinate the meeting time.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
