import { Link } from 'react-router-dom';
import { BookOpen, Laptop, Sofa, ArrowRight, ShieldCheck, Tag, Zap } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-background transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left space-y-8">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                                University Marketplace for <span className="text-primary-100">Smart Students</span>
                            </h1>
                            <p className="text-lg md:text-xl text-primary-50 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-sm">
                                Buy and sell books, electronics, furniture, and more within your campus securely and easily.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/marketplace"
                                    className="px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg"
                                >
                                    Browse Items
                                </Link>
                                <Link
                                    to="/marketplace"
                                    className="px-8 py-4 bg-primary-500/20 text-white font-bold rounded-full border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all text-lg"
                                >
                                    Sell Now
                                </Link>
                            </div>
                        </div>

                        {/* Hero Illustration / Mockup */}
                        <div className="hidden lg:block relative h-96">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl"></div>

                            <div className="relative h-full w-full flex items-center justify-center transform hover:scale-105 transition-transform duration-700">
                                <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl flex items-center justify-center w-64 h-64 -rotate-6">
                                    <Laptop className="w-32 h-32 text-white" strokeWidth={1.5} />
                                </div>
                                <div className="absolute z-20 bg-primary-100 dark:bg-gray-800 rounded-2xl p-4 shadow-xl flex items-center justify-center w-24 h-24 top-10 right-10 rotate-12 rotate-in zoom-in">
                                    <BookOpen className="w-12 h-12 text-primary-600 dark:text-primary-400" strokeWidth={1.5} />
                                </div>
                                <div className="absolute z-0 bg-yellow-100 dark:bg-yellow-900 rounded-2xl p-4 shadow-md flex items-center justify-center w-20 h-20 bottom-10 left-10 -rotate-12">
                                    <Sofa className="w-10 h-10 text-yellow-600 dark:text-yellow-400" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-green-500" /> Verified Student Profiles</div>
                    <div className="flex items-center"><Tag className="w-5 h-5 mr-2 text-primary-500" /> Zero Selling Fees</div>
                    <div className="flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500" /> Instant Local Meetups</div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Trending on Campus</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Discover what other students are buying.</p>
                        </div>
                        <Link to="/marketplace" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors">
                            View all <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    {/* Mock Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                                        {item % 2 === 0 ? 'Used' : 'Like New'}
                                    </div>
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        {item === 1 && <Laptop className="w-16 h-16 group-hover:scale-110 transition-transform" />}
                                        {item === 2 && <BookOpen className="w-16 h-16 group-hover:scale-110 transition-transform" />}
                                        {item === 3 && <Sofa className="w-16 h-16 group-hover:scale-110 transition-transform" />}
                                        {item === 4 && <Laptop className="w-16 h-16 group-hover:scale-110 transition-transform" />}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {item === 1 ? 'MacBook Air M1' : item === 2 ? 'Engineering Physics Book' : 'Study Chair'}
                                    </h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                            ${item === 1 ? '700' : item === 2 ? '25' : '40'}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">2h ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/marketplace" className="inline-flex items-center text-primary-600 font-medium">
                            View all trending items <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Promos Section */}
            <section className="py-20 bg-white dark:bg-gray-800 border-t border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-gray-700 mb-4">
                        <Tag className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Got something you don't use? <br className="hidden md:block" /> Sell it on UNMART.
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Turn your old textbooks, electronics, and dorm furniture into cash. It's free to list and takes less than 60 seconds.
                    </p>
                    <Link
                        to="/marketplace"
                        className="inline-flex px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-md hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-lg"
                    >
                        Post an Item Now
                    </Link>
                </div>
            </section>

            {/* Newsletter / Community Section */}
            <section className="py-24 bg-primary-900 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Join the UNMART Community
                    </h2>
                    <p className="text-lg text-primary-100 max-w-xl mx-auto">
                        Subscribe to get alerts on the best deals, textbook exchanges, and campus moving sales straight to your inbox.
                    </p>
                    <form className="mt-8 flex flex-col sm:flex-row max-w-md mx-auto gap-3">
                        <input
                            type="email"
                            placeholder="Enter your student email"
                            className="flex-1 px-5 py-3 rounded-full border-none focus:ring-4 focus:ring-primary-500/50 outline-none text-gray-900 placeholder-gray-500 bg-white"
                            required
                        />
                        <button
                            type="submit"
                            className="px-8 py-3 bg-primary-500 text-white font-bold rounded-full hover:bg-primary-400 transition-colors shadow-md"
                        >
                            Subscribe
                        </button>
                    </form>
                    <p className="text-xs text-primary-200/60 mt-4">We respect your inbox. No spam, ever.</p>
                </div>
            </section>
        </div>
    );
}
