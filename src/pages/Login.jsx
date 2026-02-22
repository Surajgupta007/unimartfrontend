import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            // Success! Store token and redirect
            localStorage.setItem('token', data.token);
            
            // Dispatch custom event to notify navbar of login
            window.dispatchEvent(new Event('userLoggedIn'));
            
            navigate('/marketplace');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Header */}
            <div className="login-header">
                <h1>Login Page</h1>
                <div className="login-logo-section">
                    <span className="login-logo-text">Unimart</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="login-content">
                <div className="login-wrapper">
                    {/* Left Card */}
                    <div className="login-card">
                        <div className="login-card-header">
                            <span className="login-logo-text">Unimart</span>
                        </div>

                        <div className="login-card-subtitle">User Login</div>
                        <h2 className="login-card-heading">
                            Buy & Sell<br />with Unimart
                        </h2>

                        {error && (
                            <div className="mb-6 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="login-form-group">
                                <label className="login-form-label">Email / Username</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="login-form-input"
                                    placeholder="info.kalpesh@gmail.com"
                                />
                            </div>

                            <div className="login-form-group">
                                <label className="login-form-label">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="login-form-input"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="login-checkbox-group">
                                <div>
                                    <input
                                        type="checkbox"
                                        id="auto-login"
                                        className="login-checkbox"
                                    />
                                    <label htmlFor="auto-login" className="login-checkbox-label ml-2">
                                        Auto Login
                                    </label>
                                </div>
                                <a href="#" className="login-forgot-password">
                                    Forgot Password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="login-button"
                            >
                                {loading ? 'Signing in...' : 'Log In'}
                            </button>
                        </form>

                        <div className="login-register-section">
                            <span className="login-register-text">No Account Yet? </span>
                            <Link to="/register" className="login-register-link">
                                Register
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Illustration */}
                    <div className="login-illustration">
                        <div className="login-illustration-bg">
                            <div className="text-center">
                                <p className="text-white text-lg font-semibold opacity-75">
                                    Illustration Area
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
