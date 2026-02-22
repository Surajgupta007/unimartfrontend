import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Registration failed');
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
                <h1>Register Page</h1>
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

                        <div className="login-card-subtitle">User Registration</div>
                        <h2 className="login-card-heading">
                            Create Your<br />Account
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
                                <label className="login-form-label">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="login-form-input"
                                    placeholder="Your Full Name"
                                />
                            </div>

                            <div className="login-form-group">
                                <label className="login-form-label">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="login-form-input"
                                    placeholder="you@example.com"
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

                            <div className="login-form-group">
                                <label className="login-form-label">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="login-form-input"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="login-checkbox-group mb-6">
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        required
                                        className="login-checkbox mt-1"
                                    />
                                    <label htmlFor="terms" className="text-sm text-slate-600">
                                        I agree to the Terms of Service and Privacy Policy
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="login-button"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="login-register-section">
                            <span className="login-register-text">Already have an account? </span>
                            <Link to="/login" className="login-register-link">
                                Sign In
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
