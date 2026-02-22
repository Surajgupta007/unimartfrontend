import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
    const navigate = useNavigate();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [token]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${apiUrl}/wishlist`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setWishlistProducts(data.products || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load wishlist');
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await fetch(`${apiUrl}/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setWishlistProducts(wishlistProducts.filter(p => p._id !== productId));
        } catch (err) {
            console.error('Error removing from wishlist:', err);
        }
    };

    const addToCart = async (productId) => {
        try {
            await fetch(`${apiUrl}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });
        } catch (err) {
            console.error('Error adding to cart:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Wishlist</h1>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {wishlistProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Add your favorite products to your wishlist!
                        </p>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                        >
                            Explore Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistProducts.map(product => (
                            <div key={product._id} className="relative">
                                <ProductCard product={product} />
                                <div className="absolute top-4 right-4 flex gap-2 z-10">
                                    <button
                                        onClick={() => removeFromWishlist(product._id)}
                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition"
                                    >
                                        <Heart className="h-5 w-5 fill-white" />
                                    </button>
                                    <button
                                        onClick={() => addToCart(product._id)}
                                        className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
