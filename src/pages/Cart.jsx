import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [token]);

    const fetchCart = async () => {
        try {
            const res = await fetch(`${apiUrl}/cart`, {
                headers: { 'x-auth-token': token }
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            setCart(data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to load cart: ' + err.message);
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            const res = await fetch(`${apiUrl}/cart/update/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            const data = await res.json();
            setCart(data);
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const removeItem = async (productId) => {
        try {
            const res = await fetch(`${apiUrl}/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setCart(data);
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const checkout = async () => {
        const validItems = cart?.items?.filter(item => item.product) || [];
        if (validItems.length === 0) {
            return;
        }

        try {
            // Fetch full product details including seller info for each item
            const itemsWithSeller = await Promise.all(
                validItems.map(async (item) => {
                    try {
                        const res = await fetch(`${apiUrl}/products/${item.product._id}`);
                        const productData = await res.json();
                        return {
                            product: productData,
                            seller: productData.seller,
                            quantity: item.quantity,
                            price: item.product.price
                        };
                    } catch (err) {
                        console.error('Error fetching product details:', err);
                        return {
                            product: item.product,
                            seller: null,
                            quantity: item.quantity,
                            price: item.product.price
                        };
                    }
                })
            );

            // Get meeting location from product or use placeholder
            const meetingLocation = itemsWithSeller[0]?.product?.meetingLocation || 'To be confirmed by seller';

            const orderData = {
                items: itemsWithSeller,
                totalAmount: total,
                buyerConfirmed: false,
                status: 'pending',
                meetingLocation: meetingLocation
            };

            // Save to sessionStorage and navigate to meeting confirmation
            sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
            navigate('/meeting-confirmation');
        } catch (err) {
            console.error('Error preparing checkout:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    const validItems = cart?.items?.filter(item => item.product) || [];
    const total = validItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {validItems.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Add some products to get started!
                        </p>
                        <Link
                            to="/marketplace"
                            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {validItems.map(item => (
                                <div
                                    key={item.product._id}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-6 flex gap-4"
                                >
                                    <img
                                        src={getImageUrl(item.product.images?.[0] || '')}
                                        alt={item.product.title}
                                        className="w-24 h-24 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/100x100';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <Link
                                            to={`/product/${item.product._id}`}
                                            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                                        >
                                            {item.product.title}
                                        </Link>
                                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                                            ₹{item.product.price}
                                        </p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.product._id)}
                                                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-fit sticky top-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Subtotal</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Shipping</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={checkout}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
