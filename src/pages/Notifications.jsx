import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, User, Mail, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchNotifications();
        fetchUnreadCount();
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${apiUrl}/notifications`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setNotifications(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load notifications');
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(`${apiUrl}/notifications/unread-count`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setUnreadCount(data.unreadCount);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const res = await fetch(`${apiUrl}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            
            setNotifications(prev =>
                prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
            );
            fetchUnreadCount();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleConfirmMeeting = async (id) => {
        setConfirmingId(id);
        try {
            const res = await fetch(`${apiUrl}/notifications/${id}/confirm-meeting`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || data.error || 'Failed to confirm meeting');
            }
            
            // Update notification status
            setNotifications(prev =>
                prev.map(notif => 
                    notif._id === id 
                        ? { ...notif, isRead: true, type: 'seller_confirmed' } 
                        : notif
                )
            );
            
            setSelectedNotification(null);
            fetchUnreadCount();
        } catch (err) {
            console.error('Error confirming meeting:', err);
        } finally {
            setConfirmingId(null);
        }
    };

    const handleClearAll = async () => {
        if (notifications.length === 0) {
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/notifications/clear-all`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) {
                throw new Error('Failed to clear notifications');
            }

            const data = await res.json();
            setNotifications([]);
            setSelectedNotification(null);
            setUnreadCount(0);
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'booking_request':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'seller_confirmed':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'buyer_confirmed':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            case 'payment_completed':
                return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
            default:
                return 'bg-gray-50 dark:bg-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'booking_request':
                return <AlertCircle className="h-5 w-5 text-blue-600" />;
            case 'seller_confirmed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'buyer_confirmed':
                return <CheckCircle className="h-5 w-5 text-purple-600" />;
            case 'payment_completed':
                return <CheckCircle className="h-5 w-5 text-emerald-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'booking_request':
                return 'Booking Request';
            case 'seller_confirmed':
                return 'Meeting Confirmed';
            case 'buyer_confirmed':
                return 'Buyer Confirmed';
            case 'payment_completed':
                return 'Payment Completed';
            default:
                return 'Notification';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        Booking Notifications
                    </h1>
                    <div className="flex items-center gap-4">
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                            >
                                <Trash2 className="h-5 w-5" />
                                Clear All
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            No notifications yet. When buyers book your products, they'll appear here!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Notifications List */}
                        <div className="lg:col-span-2 space-y-4">
                            {notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    onClick={() => {
                                        setSelectedNotification(notification);
                                        handleMarkAsRead(notification._id);
                                    }}
                                    className={`p-4 rounded-lg border cursor-pointer transition ${
                                        notification.isRead
                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                            : `${getTypeColor(notification.type)} border`
                                    } hover:shadow-md`}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                                )}
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                    {getTypeLabel(notification.type)}
                                                </span>
                                                {notification.type === 'booking_request' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConfirmMeeting(notification._id);
                                                        }}
                                                        disabled={confirmingId === notification._id}
                                                        className="inline-block px-3 py-1 text-xs font-semibold rounded bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {confirmingId === notification._id ? 'Confirming...' : 'Confirm Meeting'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detail View */}
                        {selectedNotification && (
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Details
                                    </h2>

                                    {/* Product Info */}
                                    {selectedNotification.product && (
                                        <div className="mb-6">
                                            <img
                                                src={getImageUrl(selectedNotification.product.images?.[0] || '')}
                                                alt={selectedNotification.product.title}
                                                className="w-full h-40 object-cover rounded-lg mb-3"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/200x200?text=Product';
                                                }}
                                            />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {selectedNotification.product.title}
                                            </h3>
                                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
                                                ₹{selectedNotification.product.price}
                                            </p>
                                        </div>
                                    )}

                                    {/* Buyer Info */}
                                    {selectedNotification.buyer && (
                                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Buyer Information
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {selectedNotification.buyer.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                    <p className="text-gray-700 dark:text-gray-300 break-all text-sm">
                                                        {selectedNotification.buyer.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Meeting Location */}
                                    {selectedNotification.order?.meetingLocation && (
                                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Meeting Location
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                                {selectedNotification.order.meetingLocation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Order Details */}
                                    {selectedNotification.order && (
                                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Order Summary
                                            </p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {selectedNotification.order._id?.slice(-8).toUpperCase() || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        ₹{selectedNotification.order.totalAmount}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                                        {selectedNotification.order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {selectedNotification.type === 'booking_request' && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleConfirmMeeting(selectedNotification._id)}
                                                disabled={confirmingId === selectedNotification._id}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {confirmingId === selectedNotification._id ? 'Confirming...' : 'Confirm Meeting'}
                                            </button>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 text-center py-2">
                                                By confirming, you agree to meet the buyer at the specified location
                                            </p>
                                        </div>
                                    )}

                                    {selectedNotification.type === 'seller_confirmed' && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
                                            <span className="text-green-800 dark:text-green-200">
                                                Meeting confirmed! Awaiting buyer confirmation.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
