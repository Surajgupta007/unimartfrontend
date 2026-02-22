import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Eye, Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function Dashboard() {
    const navigate = useNavigate();
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserData();
    }, [token]);

    const fetchUserData = async () => {
        try {
            // Fetch current user info
            const userRes = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            const userData = await userRes.json();
            setUser(userData);

            // Get all products and filter by current user
            const res = await fetch(`${apiUrl}/products`);
            const products = await res.json();

            setUserProducts(products.filter(p => p.seller?._id === userData._id || p.seller === userData._id));
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (productId) => {
        try {
            const res = await fetch(`${apiUrl}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setUserProducts(userProducts.filter(p => p._id !== productId));
            }
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome, {user?.name || 'User'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {user?.email}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Manage your products and account
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                            Products Listed
                        </p>
                        <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                            {userProducts.length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                            Total Value
                        </p>
                        <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                            ₹{userProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                            Available
                        </p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                            {userProducts.filter(p => p.status === 'available').length}
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                    >
                        <Plus className="h-5 w-5" />
                        Upload New Product
                    </button>
                </div>

                {/* Products List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Products
                        </h2>
                    </div>

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 m-6 rounded-lg">
                            {error}
                        </div>
                    )}

                    {userProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You haven't uploaded any products yet.
                            </p>
                            <button
                                onClick={() => navigate('/upload')}
                                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                            >
                                Upload Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {userProducts.map(product => (
                                        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(product.images?.[0] || '')}
                                                        alt={product.title}
                                                        className="w-10 h-10 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/40x40';
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {product.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {product._id.slice(-6)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-primary-600 dark:text-primary-400">
                                                ₹{product.price}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {product.category}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        product.status === 'available'
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/product/${product._id}`)}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProduct(product._id)}
                                                        className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
