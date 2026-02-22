import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Bell, Calendar, MapPin, User, Mail, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [confirmedLocation, setConfirmedLocation] = useState('');
    const [confirmedTime, setConfirmedTime] = useState('');
    const [confirmingId, setConfirmingId] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchBookingRequests();
    }, [token]);

    const fetchBookingRequests = async () => {
        try {
            const res = await fetch(`${apiUrl}/bookings/seller/requests`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setBookings(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load booking requests');
            setLoading(false);
        }
    };

    const handleConfirmMeeting = async (bookingId) => {
        if (!confirmedLocation && !selectedBooking?.meetingDetails?.proposedLocation) {
            return;
        }

        setConfirmingId(bookingId);
        try {
            const res = await fetch(`${apiUrl}/bookings/${bookingId}/confirm-meeting`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    confirmedLocation: confirmedLocation || selectedBooking?.meetingDetails?.proposedLocation,
                    confirmedTime: confirmedTime || selectedBooking?.meetingDetails?.proposedTime
                })
            });

            const data = await res.json();
            if (res.ok) {
                fetchBookingRequests();
                setSelectedBooking(null);
                setConfirmedLocation('');
                setConfirmedTime('');
            }
        } catch (err) {
            console.error('Error confirming meeting:', err);
        } finally {
            setConfirmingId(null);
        }
    };

    const handleRejectBooking = async (bookingId) => {
        setConfirmingId(bookingId);
        try {
            const res = await fetch(`${apiUrl}/bookings/${bookingId}/reject`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });

            const data = await res.json();
            if (res.ok) {
                fetchBookingRequests();
                setSelectedBooking(null);
            }
        } catch (err) {
            console.error('Error rejecting booking:', err);
        } finally {
            setConfirmingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    const pendingBookings = bookings.filter(b => b.status === 'pending_confirmation');
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const rejectedBookings = bookings.filter(b => b.status === 'cancelled');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Bell className="h-8 w-8 text-primary-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Seller Dashboard - Booking Requests
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 flex items-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                        <p className="text-3xl font-bold text-yellow-600">{pendingBookings.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed Meetings</p>
                        <p className="text-3xl font-bold text-green-600">{confirmedBookings.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                        <p className="text-3xl font-bold text-red-600">{rejectedBookings.length}</p>
                    </div>
                </div>

                {/* Pending Bookings */}
                {pendingBookings.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                            Pending Confirmation ({pendingBookings.length})
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {pendingBookings.map(booking => (
                                <div
                                    key={booking._id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition border-l-4 border-yellow-500"
                                >
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                        {booking.product?.title}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {booking.buyer?.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {booking.buyer?.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {booking.meetingDetails?.proposedLocation || 'TBD'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {booking.meetingDetails?.proposedTime || 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Requested at: {new Date(booking.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmed Bookings */}
                {confirmedBookings.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            Confirmed Meetings ({confirmedBookings.length})
                        </h2>
                        <div className="space-y-4">
                            {confirmedBookings.map(booking => (
                                <div
                                    key={booking._id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                                {booking.product?.title}
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {booking.buyer?.name} ({booking.buyer?.email})
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {booking.meetingDetails?.confirmedLocation}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {booking.meetingDetails?.confirmedTime}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary-600">₹{booking.product?.price}</p>
                                            {booking.paymentConfirmed && (
                                                <p className="text-xs text-green-600 font-semibold mt-2">✓ Payment Confirmed</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Bookings */}
                {bookings.length === 0 && (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            No booking requests yet. When buyers book your products, they'll appear here!
                        </p>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedBooking && selectedBooking.status === 'pending_confirmation' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Confirm Meeting
                            </h2>

                            {/* Product Info */}
                            {selectedBooking.product && (
                                <div className="mb-4">
                                    <img
                                        src={getImageUrl(selectedBooking.product.images?.[0] || '')}
                                        alt={selectedBooking.product.title}
                                        className="w-full h-40 object-cover rounded-lg mb-2"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/200x200?text=Product';
                                        }}
                                    />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {selectedBooking.product.title}
                                    </h3>
                                </div>
                            )}

                            {/* Meeting Details */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Meeting Location
                                </label>
                                <input
                                    type="text"
                                    value={confirmedLocation}
                                    onChange={(e) => setConfirmedLocation(e.target.value)}
                                    placeholder={selectedBooking.meetingDetails?.proposedLocation || 'Enter confirmed location'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Meeting Time
                                </label>
                                <input
                                    type="text"
                                    value={confirmedTime}
                                    onChange={(e) => setConfirmedTime(e.target.value)}
                                    placeholder={selectedBooking.meetingDetails?.proposedTime || 'Enter confirmed time'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleConfirmMeeting(selectedBooking._id)}
                                    disabled={confirmingId === selectedBooking._id}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                                >
                                    {confirmingId === selectedBooking._id ? '⏳ Confirming...' : '✓ Confirm Meeting'}
                                </button>
                                <button
                                    onClick={() => handleRejectBooking(selectedBooking._id)}
                                    disabled={confirmingId === selectedBooking._id}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                                >
                                    {confirmingId === selectedBooking._id ? '⏳ Rejecting...' : '✗ Reject'}
                                </button>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
