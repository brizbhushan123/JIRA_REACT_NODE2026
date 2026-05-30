import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IoEyeOffOutline,
    IoEyeOutline,
    IoLockClosedOutline,
    IoMailOutline,
    IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { useAdminAuth } from '../../App';
import { loginAdmin } from '../../services/admin/authService';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { adminLogin } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await loginAdmin({ email, password });
            const adminData = response?.data?.admin || { email };
            adminLogin(adminData);
            navigate('/admin', { replace: true });
        } catch (err) {
            setError(err.message || 'Unable to sign in as admin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page admin-login-page">
            <div className="login-bg-blob blob-1" />
            <div className="login-bg-blob blob-2" />

            <div className="admin-login-card">
                <div className="admin-login-mark">
                    <IoShieldCheckmarkOutline />
                </div>
                <h1>Admin Login</h1>
                <p>Sign in with an admin account to manage users and dashboard data.</p>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="login-input-group">
                        <label htmlFor="admin-email">Email address</label>
                        <div className="login-input-wrapper">
                            <IoMailOutline className="login-input-icon" />
                            <input
                                id="admin-email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label htmlFor="admin-password">Password</label>
                        <div className="login-input-wrapper">
                            <IoLockClosedOutline className="login-input-icon" />
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
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

                    <button
                        type="submit"
                        className={`login-submit ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="login-spinner" /> : 'Sign in as Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
