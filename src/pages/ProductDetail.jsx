import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, MapPin, User, ChevronLeft, ChevronRight, X, AlertCircle, Calendar } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [proposedLocation, setProposedLocation] = useState('');
    const [proposedTime, setProposedTime] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        checkWishlist();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${apiUrl}/products/${id}`);
            if (!res.ok) throw new Error('Product not found');
            const data = await res.json();
            setProduct(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${apiUrl}/reviews/product/${id}`);
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const checkWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${apiUrl}/wishlist`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setIsWishlisted(data.products?.some(p => p._id === id) || false);
        } catch (err) {
            console.error('Error checking wishlist:', err);
        }
    };

    const addToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ productId: id, quantity })
            });

            if (res.ok) {
                // Product added to cart
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
        }
    };

    const bookNow = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setBookingLoading(true);
        try {
            const res = await fetch(`${apiUrl}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    productId: id,
                    proposedLocation: proposedLocation || product.meetingLocation,
                    proposedTime: proposedTime || 'To be decided'
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Refresh product to show updated status
                fetchProduct();
                setProposedLocation('');
                setProposedTime('');
            } else {
                console.error('Failed to create booking:', data.msg);
            }
        } catch (err) {
            console.error('Error booking product:', err);
        } finally {
            setBookingLoading(false);
        }
    };

    const toggleWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            if (isWishlisted) {
                await fetch(`${apiUrl}/wishlist/remove/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
            } else {
                await fetch(`${apiUrl}/wishlist/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ productId: id })
                });
            }
            setIsWishlisted(!isWishlisted);
        } catch (err) {
            console.error('Error toggling wishlist:', err);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    productId: id,
                    rating,
                    review: reviewText
                })
            });

            if (res.ok) {
                setShowReviewForm(false);
                setRating(5);
                setReviewText('');
                fetchReviews();
            }
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error || !product) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">{error || 'Product not found'}</div>;
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={getImageUrl(product.images[currentImageIndex])}
                                    alt={product.title}
                                    className="w-full h-96 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                                    }}
                                />
                            ) : (
                                <img
                                    src="https://via.placeholder.com/400x400?text=Product+Image"
                                    alt={product.title}
                                    className="w-full h-96 object-cover"
                                />
                            )}

                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setCurrentImageIndex(
                                                currentImageIndex === 0
                                                    ? product.images.length - 1
                                                    : currentImageIndex - 1
                                            )
                                        }
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCurrentImageIndex(
                                                (currentImageIndex + 1) % product.images.length
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={getImageUrl(img)}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className={`h-20 object-cover rounded cursor-pointer border-2 ${
                                            currentImageIndex === idx
                                                ? 'border-primary-500'
                                                : 'border-transparent'
                                        }`}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/80x80?text=Thumbnail';
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {product.title}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            i < Math.round(averageRating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {averageRating} ({reviews.length} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                            ₹{product.price}
                        </div>

                        {/* Status Badge */}
                        {product.status === 'sold' && (
                            <div className="mb-6 bg-red-100 dark:bg-red-900 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg font-bold text-center text-lg">
                                ❌ SOLD OUT
                            </div>
                        )}

                        {/* Product Info */}
                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Condition:</span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                    {product.condition}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{product.campus}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
                                <span className="text-gray-600 dark:text-gray-400">{product.category}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                About this item
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Specifications
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                                        >
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                {key}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Display */}
                        <div className="mb-6">
                            {product.status === 'available' && (
                                <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold">
                                    ✅ Available
                                </span>
                            )}
                            {product.status === 'pending_confirmation' && (
                                <span className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg font-semibold">
                                    ⏳ Pending Confirmation
                                </span>
                            )}
                            {product.status === 'meeting_scheduled' && (
                                <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold">
                                    📅 Meeting Scheduled
                                </span>
                            )}
                            {product.status === 'sold' && (
                                <span className="inline-block px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold">
                                    ✓ Sold
                                </span>
                            )}
                        </div>

                        {/* Booking Request Form */}
                        {product.status === 'available' && (
                            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Propose Meeting Details (Optional)
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Meeting Location
                                        </label>
                                        <input
                                            type="text"
                                            value={proposedLocation}
                                            onChange={(e) => setProposedLocation(e.target.value)}
                                            placeholder={product.meetingLocation || "e.g., Library entrance, LPU campus"}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Proposed Time
                                        </label>
                                        <input
                                            type="text"
                                            value={proposedTime}
                                            onChange={(e) => setProposedTime(e.target.value)}
                                            placeholder="e.g., Today at 3 PM, Tomorrow morning"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="mb-6 space-y-3">
                            <div className="flex gap-3">
                                {product.status === 'available' ? (
                                    <button
                                        onClick={bookNow}
                                        disabled={bookingLoading}
                                        className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                                            bookingLoading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        {bookingLoading ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                Booking...
                                            </>
                                        ) : (
                                            <>
                                                <span>📋</span>
                                                Book Now
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        disabled={true}
                                        className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                                            product.status === 'sold'
                                                ? 'bg-gray-400 text-gray-600'
                                                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                                        }`}
                                    >
                                        {product.status === 'pending_confirmation' && '⏳ Awaiting Seller Confirmation'}
                                        {product.status === 'meeting_scheduled' && '📅 Meeting Scheduled'}
                                        {product.status === 'sold' && '✓ Product Sold'}
                                    </button>
                                )}
                                <button
                                    onClick={toggleWishlist}
                                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                                        isWishlisted
                                            ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <Heart
                                        className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Seller Info */}
                        {product.seller && (
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                    <User className="h-5 w-5" />
                                    Seller & Meeting Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Seller:</span> {product.seller.name}</p>
                                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {product.seller.email}</p>
                                    <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
                                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-600" /><span className="font-semibold text-gray-700 dark:text-gray-300">Meet At:</span></p>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1 pl-6">{product.meetingLocation}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic pt-2">
                                        You and the seller will meet at the above location on LPU campus to exchange the product
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Customer Reviews
                    </h2>

                    {!showReviewForm ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="mb-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                        >
                            Write a Review
                        </button>
                    ) : (
                        <form onSubmit={submitReview} className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value)}
                                            className={`text-4xl ${
                                                value <= rating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows="4"
                                    placeholder="Share your experience..."
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                                >
                                    Submit Review
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map(review => (
                                <div
                                    key={review._id}
                                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {review.user.name}
                                            </h4>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < review.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {review.review}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
