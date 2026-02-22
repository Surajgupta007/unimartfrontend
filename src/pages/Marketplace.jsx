import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Fashion', 'Hostel Essentials', 'Notes & Study Materials'];
const CONDITIONS = ['New', 'Like New', 'Used'];

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState({ categories: true, price: true, condition: true });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${apiUrl}/products`);
            const data = await res.json();
            setProducts(data);
            setFilteredProducts(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedCategories, selectedConditions, minPrice, maxPrice, products, sortBy]);

    const applyFilters = () => {
        let filtered = products;

        // Filter out sold and pending products from public marketplace
        filtered = filtered.filter(p => p.status === 'available');

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(p => selectedCategories.includes(p.category));
        }

        // Condition filter
        if (selectedConditions.length > 0) {
            filtered = filtered.filter(p => selectedConditions.includes(p.condition));
        }

        // Price filter
        if (minPrice) {
            filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Sort
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredProducts(filtered);
    };

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleCondition = (condition) => {
        setSelectedConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        setSelectedConditions([]);
        setMinPrice('');
        setMaxPrice('');
        setSortBy('latest');
    };

    const toggleFilter = (section) => {
        setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="bg-gray-50 dark:bg-dark-background min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Marketplace</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Showing {filteredProducts.length} items</p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className={`lg:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center text-gray-900 dark:text-white">
                                    <SlidersHorizontal className="w-5 h-5 mr-2 text-primary-500" /> Filters
                                </h2>
                                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Clear All</button>
                            </div>

                            {/* Categories */}
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => toggleFilter('categories')}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 dark:text-white">Categories</span>
                                    {expandedFilters.categories ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </button>
                                {expandedFilters.categories && (
                                    <div className="p-4 pt-2 space-y-3">
                                        {CATEGORIES.map(category => (
                                            <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => toggleCategory(category)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-shadow"
                                                />
                                                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{category}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price Range */}
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => toggleFilter('price')}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 dark:text-white">Price Range</span>
                                    {expandedFilters.price ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </button>
                                {expandedFilters.price && (
                                    <div className="p-4 pt-2 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Condition */}
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => toggleFilter('condition')}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 dark:text-white">Condition</span>
                                    {expandedFilters.condition ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </button>
                                {expandedFilters.condition && (
                                    <div className="p-4 pt-2 space-y-3 pb-4">
                                        {CONDITIONS.map(condition => (
                                            <label key={condition} className="flex items-center space-x-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedConditions.includes(condition)}
                                                    onChange={() => toggleCondition(condition)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-primary-600 transition-colors">{condition}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Top Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="lg:hidden inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                <Filter className="w-4 h-4 mr-2" /> Filters
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="ml-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="latest">Latest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    No products found matching your filters
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
