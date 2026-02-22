import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Trash2 } from 'lucide-react';

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [token]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${apiUrl}/orders`, {
                headers: { 'x-auth-token': token }
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Orders data:', data);
            
            // Ensure data is an array
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error('Orders response is not an array:', data);
                setOrders([]);
                setError('Invalid orders data received');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders: ' + err.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearOrder = async (orderId) => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) {
                throw new Error('Failed to delete order');
            }

            // Remove order from state
            setOrders(prev => prev.filter(order => order._id !== orderId));
        } catch (err) {
            console.error('Error deleting order:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    const statusColors = {
        pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
        confirmed: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
        shipped: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
        delivered: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
        cancelled: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            No orders yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Start shopping to place your first order!
                        </p>
                    </div>
                ) : !error && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map(order => {
                            if (!order || !order._id) return null;
                            
                            return (
                            <div
                                key={order._id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Order ID
                                        </p>
                                        <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                            {order._id.slice(-8).toUpperCase()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Items
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {order.items?.length || 0} product{(order.items?.length || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Total
                                        </p>
                                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                            ₹{(order.totalAmount || 0).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold text-center ${
                                                statusColors[order.status] || statusColors.pending
                                            }`}
                                        >
                                            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                        </span>
                                        <button
                                            onClick={() => handleClearOrder(order._id)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center justify-center gap-1 px-3 py-1.5 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Items Preview */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(order.items || []).map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                                            >
                                                {item.product?.title || 'Product'} x{item.quantity || 1}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
