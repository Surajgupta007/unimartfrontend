import { Heart, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';

export default function ProductCard({ product }) {
    const averageRating = product.averageRating || 0;
    const reviewCount = product.reviewCount || 0;

    return (
        <Link to={`/product/${product._id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 hover:scale-105">
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={getImageUrl(product.images[0])}
                            alt={product.title}
                            className={`w-full h-full object-cover ${product.status === 'sold' ? 'opacity-50' : ''}`}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                            }}
                        />
                    ) : (
                        <img
                            src="https://via.placeholder.com/300x200?text=Product+Image"
                            alt={product.title}
                            className={`w-full h-full object-cover ${product.status === 'sold' ? 'opacity-50' : ''}`}
                        />
                    )}
                    {product.status === 'sold' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-red-600 text-white px-4 py-2 rounded font-bold text-xl">
                                SOLD
                            </div>
                        </div>
                    )}
                    {product.status === 'pending_confirmation' && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold">
                            ⏳ Pending
                        </div>
                    )}
                    {product.status === 'meeting_scheduled' && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">
                            📅 Meeting Set
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        ₹{product.price}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2 mb-3">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                        i < Math.round(averageRating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            ({reviewCount})
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {product.description}
                    </p>

                    {/* Condition and Location */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {product.condition}
                        </span>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {product.campus}
                        </div>
                    </div>

                    {/* Seller Info */}
                    {product.seller && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                            <p>Seller: {product.seller.name || 'Anonymous'}</p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
