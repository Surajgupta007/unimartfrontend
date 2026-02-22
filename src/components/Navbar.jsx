import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Moon, Sun, ChevronDown, LogOut, Heart, LayoutGrid, Bell, ShoppingBag } from 'lucide-react';

export default function Navbar() {
    const [isDark, setIsDark] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        // Check if user is logged in
        checkLoginStatus();

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = () => {
            checkLoginStatus();
        };
        
        // Listen for custom login event (same tab)
        const handleLoginEvent = () => {
            checkLoginStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedIn', handleLoginEvent);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleLoginEvent);
        };
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        // Fetch notifications, cart count, and user info if logged in
        if (token) {
            fetchUserInfo(token);
            fetchUnreadNotifications(token);
            fetchCartCount(token);
        }
    };

    const fetchUserInfo = async (token) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            }
        } catch (err) {
            console.error('Error fetching user info:', err);
        }
    };

    const fetchUnreadNotifications = async (token) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
            const res = await fetch(`${apiUrl}/notifications/unread-count`, {
                headers: { 'x-auth-token': token }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setUnreadNotifications(data.unreadCount || 0);
        } catch (err) {
            console.error('Error fetching unread notifications:', err.message);
            // Don't block UI if notifications fail
            setUnreadNotifications(0);
        }
    };

    const fetchCartCount = async (token) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
            const res = await fetch(`${apiUrl}/cart`, {
                headers: { 'x-auth-token': token }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setCartCount(data.items?.length || 0);
        } catch (err) {
            console.error('Error fetching cart:', err.message);
        }
    };

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.location.href = '/login';
    };

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Leftside: Logo & Tagline */}
                    <div className="flex items-center flex-shrink-0">
                        <Link to="/" className="flex flex-col">
                            <span className="text-2xl font-bold text-primary-600 dark:text-primary-500 tracking-tight">UNMART</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Buy. Sell. Save.</span>
                        </Link>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                                placeholder="Search books, electronics, hostel items..."
                            />
                        </div>
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        
                        {isLoggedIn ? (
                            <>
                                <Link
                                    to="/marketplace"
                                    className="hidden md:flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors gap-1"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    Market
                                </Link>
                                <Link
                                    to="/upload"
                                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                                >
                                    Sell Item
                                </Link>
                                <Link
                                    to="/wishlist"
                                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                                >
                                    <Heart className="h-6 w-6" />
                                </Link>
                                <Link
                                    to="/notifications"
                                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors relative"
                                >
                                    <Bell className="h-6 w-6" />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full">
                                            {unreadNotifications}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/cart"
                                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors relative"
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="relative group">
                                    <button className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                                        <User className="h-6 w-6" />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        {user && (
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {user.email}
                                                </p>
                                            </div>
                                        )}
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            My Dashboard
                                        </Link>
                                        <Link
                                            to="/seller-dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                            Seller Dashboard
                                        </Link>
                                        <Link
                                            to="/buyer-bookings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            My Bookings
                                        </Link>
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            My Orders
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/marketplace"
                                    className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    Browse
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
