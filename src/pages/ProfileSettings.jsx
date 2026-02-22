import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check } from 'lucide-react';

export default function ProfileSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        upiNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setUser(data);
            setFormData({
                upiNumber: data.upiNumber || ''
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load user data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (!formData.upiNumber) {
                throw new Error('UPI number is required');
            }

            const res = await fetch(`${apiUrl}/auth/upi`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    upiNumber: formData.upiNumber
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Failed to update UPI details');
            }

            setUser(data);
            setSuccess('UPI details updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Profile Settings
                </h1>

                {error && (
                    <div className="mb-6 flex items-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-center bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <p className="text-green-700 dark:text-green-300">{success}</p>
                    </div>
                )}

                {/* Profile Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Profile Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                {user?.name}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* UPI Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        UPI Details (For Receiving Payments)
                    </h2>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> Enter your UPI ID (e.g., yourname@upi or phone@bank). This will be shared with buyers when they purchase your products so they can pay you directly in person at the meeting location.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="upiNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                UPI ID
                            </label>
                            <input
                                type="text"
                                id="upiNumber"
                                name="upiNumber"
                                value={formData.upiNumber}
                                onChange={handleChange}
                                placeholder="e.g., yourname@upi or 9876543210@paytm"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Examples: user@okhdfcbank, 9876543210@paytm, 9876543210@airtel
                            </p>
                        </div>

                        {user?.upiNumber && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    ✓ Current UPI: <strong>{user.upiNumber}</strong>
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition ${
                                saving
                                    ? 'bg-primary-400 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                        >
                            {saving ? 'Saving...' : 'Save UPI Details'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
