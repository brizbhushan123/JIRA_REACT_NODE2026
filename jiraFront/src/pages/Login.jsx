import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { loginUser } from '../services/authService';
import {
    IoLockClosedOutline,
    IoMailOutline,
    IoEyeOutline,
    IoEyeOffOutline,
    IoLogoGoogle,
    IoLogoGithub,
    IoLogoApple,
} from 'react-icons/io5';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (userData) => {
        login(userData);
        navigate('/board', { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await loginUser({ email, password });
            const userData = response?.data?.user || { email };
            handleLogin(userData);
        } catch (err) {
            setError(err.message || 'Unable to sign in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated background blobs */}
            <div className="login-bg-blob blob-1" />
            <div className="login-bg-blob blob-2" />
            <div className="login-bg-blob blob-3" />

            <div className="login-container">
                {/* Left panel - branding */}
                <div className="login-branding">
                    <div className="login-brand-content">
                        <div className="login-logo">
                            <div className="login-logo-icon">⚡</div>
                            <span className="login-logo-text">JiraFlow</span>
                        </div>
                        <h1 className="login-brand-title">
                            Plan, track &<br />release great software
                        </h1>
                        <p className="login-brand-subtitle">
                            The #1 project management tool for agile teams. Organize your
                            work, collaborate in real-time, and ship faster.
                        </p>
                        <div className="login-stats">
                            <div className="login-stat">
                                <span className="login-stat-number">10M+</span>
                                <span className="login-stat-label">Active Users</span>
                            </div>
                            <div className="login-stat">
                                <span className="login-stat-number">250K</span>
                                <span className="login-stat-label">Teams</span>
                            </div>
                            <div className="login-stat">
                                <span className="login-stat-number">99.9%</span>
                                <span className="login-stat-label">Uptime</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel - form */}
                <div className="login-form-panel">
                    <div className="login-form-wrapper">
                        <h2 className="login-form-title">Welcome back</h2>
                        <p className="login-form-subtitle">
                            Sign in to your account to continue
                        </p>

                        {/* Social logins */}
                        <div className="login-social">
                            <button
                                className="login-social-btn"
                                type="button"
                                onClick={() => handleLogin({ email: 'alex@company.com', name: 'Alex Morgan' })}
                            >
                                <IoLogoGoogle /> Google
                            </button>
                            <button
                                className="login-social-btn"
                                type="button"
                                onClick={() => handleLogin({ email: 'alex@company.com', name: 'Alex Morgan' })}
                            >
                                <IoLogoGithub /> GitHub
                            </button>
                            <button
                                className="login-social-btn"
                                type="button"
                                onClick={() => handleLogin({ email: 'alex@company.com', name: 'Alex Morgan' })}
                            >
                                <IoLogoApple /> Apple
                            </button>
                        </div>

                        <div className="login-divider">
                            <span>or continue with email</span>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {error && <div className="login-error">{error}</div>}

                            <div className="login-input-group">
                                <label htmlFor="email">Email address</label>
                                <div className="login-input-wrapper">
                                    <IoMailOutline className="login-input-icon" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <div className="login-label-row">
                                    <label htmlFor="password">Password</label>
                                    <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="login-input-wrapper">
                                    <IoLockClosedOutline className="login-input-icon" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="login-toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                    </button>
                                </div>
                            </div>

                            <div className="login-remember">
                                <label className="login-checkbox-label">
                                    <input type="checkbox" defaultChecked />
                                    <span>Remember me for 30 days</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={`login-submit ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="login-spinner" />
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </form>

                        <p className="login-signup-text">
                            Don't have an account?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); handleLogin({ email: 'new@company.com', name: 'Alex Morgan' }); }}>
                                Sign up for free
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
