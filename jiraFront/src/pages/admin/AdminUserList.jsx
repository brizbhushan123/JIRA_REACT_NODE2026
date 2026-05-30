import { useMemo, useState } from 'react';
import { IoPeopleOutline, IoPencilOutline, IoCloseOutline, IoTrashOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const ROLES = [
    { value: 'admin',  label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' },
];
import { useProject } from '../../context/ProjectContext';
import { useAppMeta } from '../../context/AppMetaContext';
import { updateUserApi, deleteUserApi } from '../../services/admin/userService';

export default function AdminUserList() {
    const { getProjectIssues } = useProject();
    const { users, refreshUsers } = useAppMeta();
    const issues = getProjectIssues();

    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        displayName: '',
        email: '',
        active: true,
        role: 'member',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const userMetrics = useMemo(() => {
        return users.map((user) => ({
            ...user,
            issueCount: issues.filter((issue) => String(issue.assigneeId) === String(user.id)).length,
        }));
    }, [issues, users]);

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            displayName: user.displayName || user.username || '',
            email: user.email || '',
            active: user.active !== false,
            role: user.role || 'member',
        });
        setError('');
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsSaving(true);
        setError('');
        try {
            await updateUserApi(editingUser.id, editForm);
            await refreshUsers();
            setEditingUser(null);
        } catch (err) {
            setError(err.message || 'Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        setError('');
        try {
            await deleteUserApi(userId);
            await refreshUsers();
        } catch (err) {
            setError(err.message || 'Failed to delete user');
            console.error('Delete error:', err);
        }
    };

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>User List</h1>
                    <p>View and manage all user accounts in the system.</p>
                </div>
            </div>

            <section className="admin-panel">
                <div className="admin-panel-title">
                    <IoPeopleOutline />
                    <h2>All Users</h2>
                </div>

                <div className="admin-user-table">
                    {error && <div className="create-issue-error" style={{ margin: '0 15px 15px 15px' }}>{error}</div>}
                    
                    <div className="admin-user-row admin-user-row-head" style={{ gridTemplateColumns: '1.5fr 2fr 100px 110px 140px 80px' }}>
                        <span>User</span>
                        <span>Email</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span style={{ textAlign: 'right' }}>Assigned Issues</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>
                    {userMetrics.length === 0 && (
                        <div className="admin-user-row" style={{ gridTemplateColumns: '1.5fr 2fr 100px 110px 140px 80px' }}>
                            <span className="admin-user-name" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                                No users found.
                            </span>
                        </div>
                    )}
                    {userMetrics.map((user) => (
                        <div className="admin-user-row" key={user.id} style={{ gridTemplateColumns: '1.5fr 2fr 100px 110px 140px 80px' }}>
                            <span className="admin-user-name">
                                <span className="assignee-name-small">
                                    {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                                </span>
                                {user.displayName || user.username}
                            </span>
                            <span>{user.email || '-'}</span>
                            <span>
                                <span className={`role-badge role-badge--${user.role || 'member'}`}>
                                    <IoShieldCheckmarkOutline />
                                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
                                </span>
                            </span>
                            <span>
                                <span className={`admin-status ${user.active === false ? 'inactive' : ''}`}>
                                    {user.active === false ? 'Inactive' : 'Active'}
                                </span>
                            </span>
                            <span style={{ textAlign: 'right' }}>{user.issueCount}</span>
                            <span style={{ textAlign: 'right' }}>
                                <button
                                    type="button"
                                    className="admin-action-btn"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                                    onClick={() => handleEditClick(user)}
                                    title="Edit details"
                                >
                                    <IoPencilOutline />
                                </button>
                                <button
                                    type="button"
                                    className="admin-action-btn"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-error, #de350b)', padding: '4px', marginLeft: '4px' }}
                                    onClick={() => handleDeleteUser(user.id, user.displayName || user.username)}
                                    disabled={isSaving}
                                    title="Delete user"
                                >
                                    <IoTrashOutline />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button className="modal-close" onClick={() => setEditingUser(null)}>
                                <IoCloseOutline />
                            </button>
                        </div>
                        <form className="modal-body" onSubmit={handleSaveEdit}>
                            {error && <div className="create-issue-error" style={{ marginBottom: 15 }}>{error}</div>}
                            <div className="modal-field">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.displayName}
                                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-field">
                                <label>Email address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-field">
                                <label>Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="modal-select"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-field">
                                <label className="filter-checkbox-item" style={{ marginTop: 10 }}>
                                    <input
                                        type="checkbox"
                                        checked={editForm.active}
                                        onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                                    />
                                    <span>Account is active</span>
                                </label>
                            </div>

                            <div className="create-issue-actions" style={{ marginTop: 20 }}>
                                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}