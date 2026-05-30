import { useRef, useState } from 'react';
import { IoPersonAddOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { registerUser } from '../../services/admin/authService';
import { useAppMeta } from '../../context/AppMetaContext';

const ROLES = [
    { value: 'admin',  label: 'Admin',  desc: 'Full access — manage users, projects, and all issues' },
    { value: 'member', label: 'Member', desc: 'Can create and edit issues, add comments' },
    { value: 'viewer', label: 'Viewer', desc: 'Read-only access to projects and issues' },
];

const EMPTY_USER = {
    displayName: '',
    username: '',
    email: '',
    password: '',
    role: 'member',
};

export default function AdminCreateUser() {
    const { refreshUsers } = useAppMeta();
    const [form, setForm] = useState(EMPTY_USER);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarDataUrl, setAvatarDataUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const set = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const handleAvatarFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(String(reader.result));
            setAvatarDataUrl(String(reader.result));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarDataUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await registerUser({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                displayName: form.displayName.trim() || form.username.trim(),
                avatarUrl: avatarDataUrl ?? undefined,
                role: form.role,
            });
            await refreshUsers();
            setForm(EMPTY_USER);
            setAvatarPreview(null);
            setAvatarDataUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSuccess('User created successfully.');
        } catch (err) {
            setError(err.message || 'Failed to create user.');
        } finally {
            setSubmitting(false);
        }
    };

    const initials = (form.displayName || form.username || '?').charAt(0).toUpperCase();

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Create User</h1>
                    <p>Add a new user account for the Jira workspace.</p>
                </div>
            </div>

            <section className="admin-panel admin-form-panel">
                <div className="admin-panel-title">
                    <IoPersonAddOutline />
                    <h2>User Details</h2>
                </div>

                <form className="admin-user-form" onSubmit={handleSubmit}>
                    {error && <div className="create-issue-error">{error}</div>}
                    {success && <div className="admin-success">{success}</div>}

                    <div className="create-issue-field">
                        <label>Profile Photo</label>
                        <div className="admin-avatar-picker">
                            <div className="admin-avatar-preview">
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="Profile preview" />
                                    : <span className="admin-avatar-initials">{initials}</span>
                                }
                            </div>
                            <div className="admin-avatar-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                {avatarPreview && (
                                    <button type="button" className="btn-ghost" onClick={handleRemoveAvatar}>
                                        Remove
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarFile}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="create-issue-field">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={form.displayName}
                            onChange={set('displayName')}
                            placeholder="Example: Anika Sharma"
                        />
                    </div>

                    <div className="create-issue-field">
                        <label>Username <span className="required">*</span></label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={set('username')}
                            placeholder="anika.sharma"
                            required
                        />
                    </div>

                    <div className="create-issue-field">
                        <label>Email <span className="required">*</span></label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={set('email')}
                            placeholder="anika@company.com"
                            required
                        />
                    </div>

                    <div className="create-issue-field">
                        <label>Role <span className="required">*</span></label>
                        <div className="role-picker">
                            {ROLES.map((r) => (
                                <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r.value}
                                        checked={form.role === r.value}
                                        onChange={set('role')}
                                    />
                                    <span className="role-option-label">
                                        <IoShieldCheckmarkOutline />
                                        <strong>{r.label}</strong>
                                    </span>
                                    <span className="role-option-desc">{r.desc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="create-issue-field">
                        <label>Password <span className="required">*</span></label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={set('password')}
                            placeholder="Minimum 6 characters"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="create-issue-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setForm(EMPTY_USER);
                                setAvatarPreview(null);
                                setAvatarDataUrl(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                setError('');
                                setSuccess('');
                            }}
                        >
                            Reset
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
