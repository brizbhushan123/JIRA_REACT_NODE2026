import { useEffect, useRef, useState } from 'react';
import {
    IoPersonAddOutline,
    IoEyeOutline,
    IoEyeOffOutline,
    IoCodeSlashOutline,
    IoChevronDown,
    IoCloseOutline,
    IoCheckmarkOutline,
    IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { registerUser } from '../../services/admin/authService';
import { fetchAdminProjects } from '../../services/admin/projectService';
import { useAppMeta } from '../../context/AppMetaContext';

const DEVELOPER_ROLES = [
    { value: 'Developer',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { value: 'Senior Developer', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { value: 'QA Engineer',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { value: 'DevOps',           color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { value: 'Scrum Master',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
    { value: 'Project Manager',  color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
];

const TEAMS = [
    'Frontend Team',
    'Backend Team',
    'Full Stack Team',
    'QA Team',
    'DevOps Team',
    'Mobile Team',
    'Data Team',
    'Platform Team',
];

const EMPTY = {
    displayName: '',
    username:    '',
    email:       '',
    password:    '',
    phone:       '',
    employeeId:  '',
    jobTitle:    'Developer',
    team:        '',
    active:      true,
};

export default function AdminCreateDeveloper() {
    const { refreshUsers } = useAppMeta();

    const [form, setForm]               = useState(EMPTY);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarDataUrl, setAvatarDataUrl] = useState(null);
    const [showPassword, setShowPassword]   = useState(false);
    const [submitting, setSubmitting]       = useState(false);
    const [error, setError]                 = useState('');
    const [success, setSuccess]             = useState('');
    const [fieldErrors, setFieldErrors]     = useState({});

    const [projects, setProjects]         = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [projectDropOpen, setProjectDropOpen]   = useState(false);

    const fileInputRef   = useRef(null);
    const projectDropRef = useRef(null);

    useEffect(() => {
        fetchAdminProjects()
            .then((res) => setProjects(res?.data?.projects || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!projectDropOpen) return;
        const handler = (e) => {
            if (projectDropRef.current && !projectDropRef.current.contains(e.target))
                setProjectDropOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [projectDropOpen]);

    const set = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        if (fieldErrors[field]) setFieldErrors((fe) => ({ ...fe, [field]: '' }));
    };

    const handleAvatarFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(String(reader.result));
            setAvatarDataUrl(String(reader.result));
        };
        reader.readAsDataURL(file);
    };

    const toggleProject = (project) => {
        setSelectedProjects((prev) =>
            prev.some((p) => p.id === project.id)
                ? prev.filter((p) => p.id !== project.id)
                : [...prev, project]
        );
    };

    const removeProject = (id) =>
        setSelectedProjects((prev) => prev.filter((p) => p.id !== id));

    const validate = () => {
        const errs = {};
        if (!form.displayName.trim()) errs.displayName = 'Full name is required';
        if (!form.username.trim())    errs.username    = 'Username is required';
        if (!form.email.trim())       errs.email       = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
        if (!form.password)           errs.password    = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
        if (!form.jobTitle)           errs.jobTitle    = 'Role is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const errs = validate();
        if (Object.keys(errs).length) {
            setFieldErrors(errs);
            return;
        }

        setSubmitting(true);
        try {
            await registerUser({
                username:    form.username.trim(),
                email:       form.email.trim(),
                password:    form.password,
                displayName: form.displayName.trim(),
                avatarUrl:   avatarDataUrl ?? undefined,
                role:        'member',
                phone:       form.phone.trim() || undefined,
                employeeId:  form.employeeId.trim() || undefined,
                jobTitle:    form.jobTitle,
                team:        form.team || undefined,
                active:      form.active,
            });
            await refreshUsers();
            setForm(EMPTY);
            setAvatarPreview(null);
            setAvatarDataUrl(null);
            setSelectedProjects([]);
            setFieldErrors({});
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSuccess('Developer account created successfully.');
        } catch (err) {
            setError(err.message || 'Failed to create user.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm(EMPTY);
        setAvatarPreview(null);
        setAvatarDataUrl(null);
        setSelectedProjects([]);
        setFieldErrors({});
        setError('');
        setSuccess('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const initials = (form.displayName || form.username || '?').charAt(0).toUpperCase();
    const activeRole = DEVELOPER_ROLES.find((r) => r.value === form.jobTitle);

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Create Developer</h1>
                    <p>Add a new developer account to the workspace.</p>
                </div>
            </div>

            <form className="dev-create-layout" onSubmit={handleSubmit} noValidate>
                {/* ── Left column ── */}
                <div className="dev-create-left">
                    {/* Avatar card */}
                    <div className="admin-panel dev-avatar-card">
                        <div className="dev-avatar-wrap">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="Preview" className="dev-avatar-img" />
                                : <div className="dev-avatar-placeholder">{initials}</div>
                            }
                        </div>
                        <div className="dev-avatar-meta">
                            <span className="dev-avatar-name">{form.displayName || 'Full Name'}</span>
                            {activeRole && (
                                <span
                                    className="dev-role-badge"
                                    style={{ color: activeRole.color, background: activeRole.bg }}
                                >
                                    {form.jobTitle}
                                </span>
                            )}
                            {form.team && (
                                <span className="dev-team-tag">{form.team}</span>
                            )}
                        </div>
                        <div className="dev-avatar-btns">
                            <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                            </button>
                            {avatarPreview && (
                                <button type="button" className="btn-ghost" onClick={() => { setAvatarPreview(null); setAvatarDataUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                                    Remove
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
                    </div>

                    {/* Account Status card */}
                    <div className="admin-panel">
                        <div className="admin-panel-title">
                            <IoShieldCheckmarkOutline />
                            <h2>Account Status</h2>
                        </div>
                        <div className="dev-status-group">
                            <label className={`dev-status-option${form.active ? ' active' : ''}`}>
                                <input type="radio" name="status" checked={form.active} onChange={() => setForm((f) => ({ ...f, active: true }))} />
                                <div className="dev-status-dot active-dot" />
                                <div>
                                    <strong>Active</strong>
                                    <span>Can log in and access projects</span>
                                </div>
                            </label>
                            <label className={`dev-status-option${!form.active ? ' active' : ''}`}>
                                <input type="radio" name="status" checked={!form.active} onChange={() => setForm((f) => ({ ...f, active: false }))} />
                                <div className="dev-status-dot inactive-dot" />
                                <div>
                                    <strong>Inactive</strong>
                                    <span>Account disabled, no login access</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── Right column (main form) ── */}
                <div className="dev-create-right">
                    {error   && <div className="create-issue-error">{error}</div>}
                    {success && <div className="admin-success">{success}</div>}

                    {/* Personal Info */}
                    <div className="admin-panel">
                        <div className="admin-panel-title">
                            <IoPersonAddOutline />
                            <h2>Personal Information</h2>
                        </div>
                        <div className="dev-form-body">
                            <div className="create-issue-row">
                                <div className="create-issue-field">
                                    <label>Full Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={form.displayName}
                                        onChange={set('displayName')}
                                        placeholder="e.g. Arjun Mehta"
                                        className={fieldErrors.displayName ? 'field-error' : ''}
                                    />
                                    {fieldErrors.displayName && <span className="field-error-msg">{fieldErrors.displayName}</span>}
                                </div>
                                <div className="create-issue-field">
                                    <label>Username <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={set('username')}
                                        placeholder="e.g. arjun.mehta"
                                        className={fieldErrors.username ? 'field-error' : ''}
                                    />
                                    {fieldErrors.username && <span className="field-error-msg">{fieldErrors.username}</span>}
                                </div>
                            </div>

                            <div className="create-issue-row">
                                <div className="create-issue-field">
                                    <label>Email Address <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={set('email')}
                                        placeholder="arjun@company.com"
                                        className={fieldErrors.email ? 'field-error' : ''}
                                    />
                                    {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
                                </div>
                                <div className="create-issue-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={set('phone')}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Security */}
                    <div className="admin-panel">
                        <div className="admin-panel-title">
                            <IoCodeSlashOutline />
                            <h2>Account Security</h2>
                        </div>
                        <div className="dev-form-body">
                            <div className="create-issue-row">
                                <div className="create-issue-field">
                                    <label>Password <span className="required">*</span></label>
                                    <div className="dev-input-wrap">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={set('password')}
                                            placeholder="Minimum 6 characters"
                                            className={fieldErrors.password ? 'field-error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="dev-eye-btn"
                                            onClick={() => setShowPassword((v) => !v)}
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
                                </div>
                                <div className="create-issue-field">
                                    <label>Employee ID</label>
                                    <input
                                        type="text"
                                        value={form.employeeId}
                                        onChange={set('employeeId')}
                                        placeholder="e.g. EMP-1042"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role & Team */}
                    <div className="admin-panel">
                        <div className="admin-panel-title">
                            <IoShieldCheckmarkOutline />
                            <h2>Role &amp; Team</h2>
                        </div>
                        <div className="dev-form-body">
                            <div className="create-issue-row">
                                <div className="create-issue-field">
                                    <label>Developer Role <span className="required">*</span></label>
                                    <div className="dev-role-select-wrap">
                                        <select
                                            value={form.jobTitle}
                                            onChange={set('jobTitle')}
                                            className={fieldErrors.jobTitle ? 'field-error' : ''}
                                        >
                                            {DEVELOPER_ROLES.map((r) => (
                                                <option key={r.value} value={r.value}>{r.value}</option>
                                            ))}
                                        </select>
                                        {activeRole && (
                                            <span
                                                className="dev-select-badge"
                                                style={{ color: activeRole.color, background: activeRole.bg }}
                                            >
                                                {form.jobTitle}
                                            </span>
                                        )}
                                    </div>
                                    {fieldErrors.jobTitle && <span className="field-error-msg">{fieldErrors.jobTitle}</span>}
                                </div>
                                <div className="create-issue-field">
                                    <label>Team</label>
                                    <select value={form.team} onChange={set('team')}>
                                        <option value="">— No team —</option>
                                        {TEAMS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Assignment */}
                    <div className="admin-panel">
                        <div className="admin-panel-title">
                            <IoCheckmarkOutline />
                            <h2>Assign Projects</h2>
                        </div>
                        <div className="dev-form-body">
                            <div className="create-issue-field">
                                <label>Projects</label>

                                {/* Selected tags */}
                                {selectedProjects.length > 0 && (
                                    <div className="dev-project-tags">
                                        {selectedProjects.map((p) => (
                                            <span key={p.id} className="dev-project-tag">
                                                {p.pname || p.name}
                                                <button
                                                    type="button"
                                                    className="dev-tag-remove"
                                                    onClick={() => removeProject(p.id)}
                                                >
                                                    <IoCloseOutline />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="dev-project-multi" ref={projectDropRef}>
                                    <button
                                        type="button"
                                        className="dev-project-trigger"
                                        onClick={() => setProjectDropOpen((o) => !o)}
                                    >
                                        <span>{selectedProjects.length ? `${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''} selected` : 'Select projects…'}</span>
                                        <IoChevronDown className={`dev-chevron${projectDropOpen ? ' open' : ''}`} />
                                    </button>

                                    {projectDropOpen && (
                                        <div className="dev-project-dropdown">
                                            {projects.length === 0 ? (
                                                <div className="dev-project-empty">No projects available</div>
                                            ) : (
                                                projects.map((p) => {
                                                    const checked = selectedProjects.some((s) => s.id === p.id);
                                                    return (
                                                        <label key={p.id} className={`dev-project-item${checked ? ' checked' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleProject(p)}
                                                            />
                                                            <span className="dev-project-key">{p.pkey || '—'}</span>
                                                            <span className="dev-project-name">{p.pname || p.name}</span>
                                                            {checked && <IoCheckmarkOutline className="dev-project-check" />}
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="create-issue-actions">
                        <button type="button" className="btn-secondary" onClick={handleReset}>
                            Reset
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating…' : 'Create Developer'}
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}
