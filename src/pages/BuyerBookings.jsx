import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, MapPin, Calendar, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuyerBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [confirmedPayment, setConfirmedPayment] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

    useEffect(() => {
        fetchBuyerBookings();
    }, []);

    const fetchBuyerBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/bookings/buyer/my-bookings`, {
                headers: { 'x-auth-token': token }
            });
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async (bookingId) => {
        if (!confirmedPayment) {
            return;
        }

        setPaymentLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/bookings/${bookingId}/confirm-payment`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const updated = await response.json();
                setBookings(bookings.map(b => b._id === bookingId ? updated : b));
                setPaymentModal(false);
                setConfirmedPayment(false);
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
        } finally {
            setPaymentLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending_confirmation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'meeting_scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'sold': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-800'
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending_confirmation': { icon: Clock, text: 'Awaiting Seller' },
            'confirmed': { icon: CheckCircle, text: 'Meeting Confirmed' },
            'meeting_scheduled': { icon: Calendar, text: 'Meeting Scheduled' },
            'sold': { icon: CheckCircle, text: 'Payment Done - Sold' },
            'cancelled': { icon: AlertCircle, text: 'Booking Cancelled' }
        };
        return icons[status] || { icon: Clock, text: 'Processing' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
                </div>

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">No bookings yet. Start exploring!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => {
                            const statusInfo = getStatusIcon(booking.productStatus);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                                <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                    {/* Top Row: Product Info & Status */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {booking.product?.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                Seller: {booking.seller?.name}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.productStatus)}`}>
                                            <StatusIcon className="h-4 w-4" />
                                            {statusInfo.text}
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="grid md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                                            <p className="text-lg font-bold text-primary-600">₹{booking.product?.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{booking.seller?.phone}</p>
                                        </div>
                                    </div>

                                    {/* Proposed Details */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Proposed Meeting Details</p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-primary-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                                                    <p className="text-sm text-gray-900 dark:text-white">{booking.meetingDetails?.proposedLocation || 'Not specified'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-primary-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                                                    <p className="text-sm text-gray-900 dark:text-white">{booking.meetingDetails?.proposedTime || 'Not specified'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmed Meeting Details (if applicable) */}
                                    {booking.productStatus === 'meeting_scheduled' && booking.meetingDetails?.confirmedLocation && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">Confirmed Meeting</p>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-blue-700 dark:text-blue-400">Location</p>
                                                        <p className="text-sm text-blue-900 dark:text-blue-200">{booking.meetingDetails.confirmedLocation}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-blue-700 dark:text-blue-400">Time</p>
                                                        <p className="text-sm text-blue-900 dark:text-blue-200">{booking.meetingDetails.confirmedTime}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        {booking.productStatus === 'meeting_scheduled' && !booking.paymentConfirmed && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setPaymentModal(true);
                                                    setConfirmedPayment(false);
                                                }}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Confirm Payment
                                            </button>
                                        )}
                                        {booking.paymentConfirmed && (
                                            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm font-medium">
                                                ✓ Payment Confirmed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Payment Confirmation Modal */}
            {paymentModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Payment</h2>
                        
                        {/* Payment Details */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Product:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{selectedBooking.product?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                    <span className="text-gray-900 dark:text-white font-bold">₹{selectedBooking.product?.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Seller Phone:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{selectedBooking.seller?.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                                <strong>Tips:</strong> Make the payment to the seller's UPI/Phone number and confirm below after completing the transaction.
                            </p>
                        </div>

                        {/* Confirmation Checkbox */}
                        <div className="flex items-start gap-3 mb-4">
                            <input
                                type="checkbox"
                                id="paymentConfirm"
                                checked={confirmedPayment}
                                onChange={(e) => setConfirmedPayment(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600"
                            />
                            <label htmlFor="paymentConfirm" className="text-sm text-gray-700 dark:text-gray-300">
                                I have made the payment to {selectedBooking.seller?.name}
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPaymentModal(false);
                                    setConfirmedPayment(false);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleConfirmPayment(selectedBooking._id)}
                                disabled={paymentLoading || !confirmedPayment}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {paymentLoading ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Payment'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
