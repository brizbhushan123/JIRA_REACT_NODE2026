import { useState } from 'react';
import {
    IoRocketOutline,
    IoAddOutline,
    IoPlayOutline,
    IoCheckmarkDoneOutline,
    IoTrashOutline,
    IoPencilOutline,
    IoCloseOutline,
} from 'react-icons/io5';
import { useProject } from '../../context/ProjectContext';
import { useAppMeta } from '../../context/AppMetaContext';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_CLASS = { ACTIVE: 'active', PLANNING: 'future', COMPLETED: 'completed' };

export default function AdminSprints() {
    const {
        sprints,
        createSprint, updateSprint, startSprint, completeSprint, deleteSprint,
    } = useProject();
    const { currentProject } = useAppMeta();

    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const [editSprint, setEditSprint] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const [actionError, setActionError] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            await createSprint({
                name: createForm.name.trim(),
                goal: createForm.goal.trim() || undefined,
                startDate: createForm.startDate || undefined,
                endDate: createForm.endDate || undefined,
            });
            setShowCreate(false);
            setCreateForm({ name: '', goal: '', startDate: '', endDate: '' });
        } catch (err) {
            setCreateError(err.message || 'Failed to create sprint');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditOpen = (s) => {
        setEditSprint(s);
        setEditForm({
            name: s.name,
            goal: s.goal || '',
            startDate: s.startDate ? s.startDate.slice(0, 10) : '',
            endDate: s.endDate ? s.endDate.slice(0, 10) : '',
        });
        setEditError('');
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        try {
            await updateSprint(editSprint.id, {
                name: editForm.name.trim(),
                goal: editForm.goal.trim() || undefined,
                startDate: editForm.startDate || undefined,
                endDate: editForm.endDate || undefined,
            });
            setEditSprint(null);
        } catch (err) {
            setEditError(err.message || 'Failed to update sprint');
        } finally {
            setEditLoading(false);
        }
    };

    const handleStart = async (s) => {
        setActionError('');
        try { await startSprint(s.id); } catch (err) { setActionError(err.message); }
    };

    const handleComplete = async (s) => {
        if (!window.confirm(`Complete sprint "${s.name}"?`)) return;
        setActionError('');
        try { await completeSprint(s.id); } catch (err) { setActionError(err.message); }
    };

    const handleDelete = async (s) => {
        if (!window.confirm(`Delete sprint "${s.name}"?`)) return;
        setActionError('');
        try { await deleteSprint(s.id); } catch (err) { setActionError(err.message); }
    };

    const sorted = [...sprints].sort((a, b) => {
        const order = { ACTIVE: 0, PLANNING: 1, COMPLETED: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Sprint Management</h1>
                    <p>Create and manage sprints for {currentProject?.pname || 'your project'}.</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                    onClick={() => setShowCreate(true)}
                >
                    <IoAddOutline /> New Sprint
                </button>
            </div>

            {actionError && (
                <div className="create-issue-error" style={{ marginBottom: 12 }}>{actionError}</div>
            )}

            <section className="admin-panel">
                <div className="admin-panel-title">
                    <IoRocketOutline />
                    <h2>All Sprints</h2>
                </div>

                <div className="admin-user-table">
                    <div className="admin-user-row admin-user-row-head" style={{ gridTemplateColumns: '2fr 1.5fr 110px 130px 130px 120px' }}>
                        <span>Name</span>
                        <span>Goal</span>
                        <span>Status</span>
                        <span>Start Date</span>
                        <span>End Date</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>

                    {sorted.length === 0 && (
                        <div className="admin-user-row" style={{ gridTemplateColumns: '1fr' }}>
                            <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sprints yet. Create one above.</span>
                        </div>
                    )}

                    {sorted.map((s) => (
                        <div key={s.id} className="admin-user-row" style={{ gridTemplateColumns: '2fr 1.5fr 110px 130px 130px 120px' }}>
                            <span style={{ fontWeight: 600 }}>{s.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.goal || '—'}</span>
                            <span>
                                <span className={`sprint-status ${STATUS_CLASS[s.status] || 'future'}`}>{s.status}</span>
                            </span>
                            <span style={{ fontSize: 13 }}>{fmtDate(s.startDate)}</span>
                            <span style={{ fontSize: 13 }}>{fmtDate(s.endDate)}</span>
                            <span style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                {s.status === 'PLANNING' && (
                                    <button className="sprint-action-btn start" title="Start" onClick={() => handleStart(s)}>
                                        <IoPlayOutline />
                                    </button>
                                )}
                                {s.status === 'ACTIVE' && (
                                    <button className="sprint-action-btn complete" title="Complete" onClick={() => handleComplete(s)}>
                                        <IoCheckmarkDoneOutline />
                                    </button>
                                )}
                                {s.status !== 'COMPLETED' && (
                                    <button className="sprint-action-btn edit" title="Edit" onClick={() => handleEditOpen(s)}>
                                        <IoPencilOutline />
                                    </button>
                                )}
                                {s.status === 'PLANNING' && (
                                    <button className="sprint-action-btn danger" title="Delete" onClick={() => handleDelete(s)}>
                                        <IoTrashOutline />
                                    </button>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Create modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Sprint</h2>
                            <button className="modal-close" onClick={() => setShowCreate(false)}><IoCloseOutline /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleCreate}>
                            {createError && <div className="create-issue-error" style={{ marginBottom: 12 }}>{createError}</div>}
                            <div className="modal-field">
                                <label>Sprint Name <span className="required">*</span></label>
                                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. Sprint 1" required autoFocus />
                            </div>
                            <div className="modal-field">
                                <label>Sprint Goal</label>
                                <input type="text" value={createForm.goal} onChange={(e) => setCreateForm({ ...createForm, goal: e.target.value })} placeholder="What is the objective?" />
                            </div>
                            <div className="modal-field-row">
                                <div className="modal-field">
                                    <label>Start Date</label>
                                    <input type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} />
                                </div>
                                <div className="modal-field">
                                    <label>End Date</label>
                                    <input type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="create-issue-actions" style={{ marginTop: 20 }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={createLoading}>
                                    {createLoading ? 'Creating…' : 'Create Sprint'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editSprint && (
                <div className="modal-overlay" onClick={() => setEditSprint(null)}>
                    <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Sprint</h2>
                            <button className="modal-close" onClick={() => setEditSprint(null)}><IoCloseOutline /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleEditSave}>
                            {editError && <div className="create-issue-error" style={{ marginBottom: 12 }}>{editError}</div>}
                            <div className="modal-field">
                                <label>Sprint Name <span className="required">*</span></label>
                                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required autoFocus />
                            </div>
                            <div className="modal-field">
                                <label>Sprint Goal</label>
                                <input type="text" value={editForm.goal} onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })} />
                            </div>
                            <div className="modal-field-row">
                                <div className="modal-field">
                                    <label>Start Date</label>
                                    <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
                                </div>
                                <div className="modal-field">
                                    <label>End Date</label>
                                    <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="create-issue-actions" style={{ marginTop: 20 }}>
                                <button type="button" className="btn-secondary" onClick={() => setEditSprint(null)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={editLoading}>
                                    {editLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
