import { useState } from 'react';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductUpload() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Books',
        condition: 'Like New',
        meetingLocation: ''
    });

    const [images, setImages] = useState([]);
    const [specifications, setSpecifications] = useState({});
    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = ['Books', 'Electronics', 'Furniture', 'Fashion', 'Hostel Essentials', 'Notes & Study Materials'];
    const conditions = ['New', 'Like New', 'Used'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
        setError('');
    };

    const removeImage = (index) => {
        setImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Revoke the preview URL to free up memory
            URL.revokeObjectURL(prev[index].preview);
            return updated;
        });
    };

    const addSpecification = () => {
        if (specKey.trim() && specValue.trim()) {
            setSpecifications(prev => ({
                ...prev,
                [specKey]: specValue
            }));
            setSpecKey('');
            setSpecValue('');
        }
    };

    const removeSpecification = (key) => {
        setSpecifications(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.title.trim()) {
            setError('Product title is required');
            return;
        }
        if (!formData.description.trim()) {
            setError('Product description is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Please enter a valid price');
            return;
        }
        if (images.length < 3) {
            setError('Please upload at least 3 product images');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('meetingLocation', formData.meetingLocation);
            formDataToSend.append('specifications', JSON.stringify(specifications));

            // Add images
            images.forEach(imgObj => {
                formDataToSend.append('images', imgObj.file);
            });

            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to upload a product');
                setLoading(false);
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
            const response = await fetch(`${apiUrl}/products`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || data.error || 'Failed to upload product');
                console.error('Upload error details:', data);
                return;
            }

            setSuccess('Product uploaded successfully!');
            // Reset form
            setFormData({
                title: '',
                description: '',
                price: '',
                category: 'Books',
                condition: 'Like New',
                meetingLocation: ''
            });
            setImages([]);
            setSpecifications({});

            // Redirect to marketplace after 2 seconds
            setTimeout(() => navigate('/marketplace'), 2000);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'An error occurred while uploading the product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sell Your Product</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Fill in the details below to list your product on UNMART</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-800 dark:text-red-100">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-green-800 dark:text-green-100">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Calculus Textbook, Dell Laptop, Hostel Bed"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Product Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your product in detail..."
                                rows="5"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Price and Category Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="Enter price"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Condition and Campus Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Condition *
                                </label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {conditions.map(cond => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Meeting Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Meeting Location (LPU Campus)
                                </label>
                                <input
                                    type="text"
                                    name="meetingLocation"
                                    value={formData.meetingLocation}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Library Ground Floor, Block A Gate, Cafeteria (Optional - can be added later)"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    Optional: Specify where on LPU campus you and the buyer will meet. You can update this after the buyer books your product.
                                </p>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Product Images (Minimum 3) *
                            </label>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                Upload at least 3 photos from different angles/parts of your product
                            </p>

                            {/* Image Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-input"
                                />
                                <label htmlFor="image-input" className="cursor-pointer">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Drag and drop images here or <span className="text-primary-600 dark:text-primary-400 font-semibold">click to browse</span>
                                    </p>
                                </label>
                            </div>

                            {/* Image Preview */}
                            {images.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        Selected Images ({images.length})
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={img.preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                        Primary
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specifications Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Product Specifications
                            </label>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                Add key details about your product (e.g., Brand: Apple, Storage: 256GB, etc.)
                            </p>

                            {/* Add Specification Input */}
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    value={specKey}
                                    onChange={(e) => setSpecKey(e.target.value)}
                                    placeholder="e.g., Brand, Storage, Color"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="text"
                                    value={specValue}
                                    onChange={(e) => setSpecValue(e.target.value)}
                                    placeholder="e.g., Apple, 256GB, Silver"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Add
                                </button>
                            </div>

                            {/* Specifications List */}
                            {Object.keys(specifications).length > 0 && (
                                <div className="space-y-2">
                                    {Object.entries(specifications).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{key}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(key)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                {loading ? 'Uploading...' : 'Upload Product'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/marketplace')}
                                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
