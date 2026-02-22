import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function OrderDetail() {
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
        if (orderId) {
            fetchOrder();
        }
    }, [orderId, token]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setOrder(data);
        } catch (err) {
            setError('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error || !order) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                {error || 'Order not found'}
            </div>
        );
    }

    const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentStep = statusSteps.indexOf(order.status);

    const statusColors = {
        pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
        confirmed: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
        shipped: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
        delivered: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
        cancelled: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Back to Orders
                </button>

                {/* Order Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    </div>

                    {/* Order Timeline */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-3">
                            {statusSteps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                                            idx <= currentStep
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        {idx < currentStep ? (
                                            <CheckCircle className="h-6 w-6" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                                        {step.charAt(0).toUpperCase() + step.slice(1)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Items
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex gap-4">
                                        <img
                                            src={getImageUrl(item.product.images?.[0] || '')}
                                            alt={item.product.title}
                                            className="w-24 h-24 object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100x100';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {item.product.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Unit Price: ₹{item.price}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {order.shippingAddress}
                            </p>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Order Summary
                            </h3>
                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span className="text-primary-600 dark:text-primary-400">
                                    ₹{order.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                                Payment Status
                            </h3>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                    order.paymentStatus === 'paid'
                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                        : order.paymentStatus === 'failed'
                                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                }`}
                            >
                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
