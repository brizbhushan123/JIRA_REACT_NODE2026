import { useEffect, useState } from 'react';
import {
    IoFolderOpenOutline,
    IoAddOutline,
    IoPencilOutline,
    IoTrashOutline,
    IoCloseOutline,
    IoSearchOutline,
} from 'react-icons/io5';
import { fetchAdminProjects, createProjectApi, updateProjectApi, deleteProjectApi } from '../../services/admin/projectService';
import { useAppMeta } from '../../context/AppMetaContext';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* auto-generate a project key from a name: "My Cool Project" → "MCP" */
const toKey = (name) =>
    name.trim()
        .split(/\s+/)
        .map((w) => w[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 10) || name.slice(0, 5).toUpperCase();

const EMPTY_FORM = { pname: '', pkey: '', description: '', lead: '' };

export default function AdminCreateProject() {
    const { users, refreshProjects } = useAppMeta();

    const [projects, setProjects]     = useState([]);
    const [search, setSearch]         = useState('');
    const [loading, setLoading]       = useState(true);

    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(EMPTY_FORM);
    const [keyEdited, setKeyEdited]   = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError]     = useState('');

    const [editProject, setEditProject]   = useState(null);
    const [editForm, setEditForm]         = useState({ pname: '', description: '', lead: '' });
    const [editLoading, setEditLoading]   = useState(false);
    const [editError, setEditError]       = useState('');

    const [actionError, setActionError] = useState('');

    const load = async (q = search) => {
        setLoading(true);
        try {
            const res = await fetchAdminProjects(q);
            setProjects(res.data?.projects || []);
        } catch {
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    /* search debounce */
    useEffect(() => {
        const t = setTimeout(() => load(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    /* auto-generate key from name while user hasn't manually edited it */
    const handleNameChange = (value) => {
        setCreateForm((f) => ({
            ...f,
            pname: value,
            pkey: keyEdited ? f.pkey : toKey(value),
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            await createProjectApi({
                pname: createForm.pname.trim(),
                pkey: createForm.pkey.trim().toUpperCase(),
                description: createForm.description.trim() || undefined,
                lead: createForm.lead.trim() || undefined,
            });
            await load();
            if (refreshProjects) await refreshProjects();
            setShowCreate(false);
            setCreateForm(EMPTY_FORM);
            setKeyEdited(false);
        } catch (err) {
            setCreateError(err.message || 'Failed to create project');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditOpen = (p) => {
        setEditProject(p);
        setEditForm({ pname: p.pname || '', description: p.description || '', lead: p.lead || '' });
        setEditError('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        try {
            await updateProjectApi(editProject.id, {
                pname: editForm.pname.trim(),
                description: editForm.description.trim() || undefined,
                lead: editForm.lead.trim() || undefined,
            });
            await load();
            if (refreshProjects) await refreshProjects();
            setEditProject(null);
        } catch (err) {
            setEditError(err.message || 'Failed to update project');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete project "${p.pname}"? This will also delete all sprints and issues linked to it.`)) return;
        setActionError('');
        try {
            await deleteProjectApi(p.id);
            await load();
            if (refreshProjects) await refreshProjects();
        } catch (err) {
            setActionError(err.message || 'Failed to delete project');
        }
    };

    const userList = Array.isArray(users) ? users : (users?.users || []);

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Projects</h1>
                    <p>Create and manage projects in the workspace.</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                    onClick={() => { setShowCreate(true); setCreateError(''); }}
                >
                    <IoAddOutline /> New Project
                </button>
            </div>

            {actionError && (
                <div className="create-issue-error" style={{ marginBottom: 12 }}>{actionError}</div>
            )}

            <section className="admin-panel">
                <div className="admin-panel-title" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <IoFolderOpenOutline />
                        <h2>All Projects</h2>
                    </div>
                    <div className="project-admin-search">
                        <IoSearchOutline />
                        <input
                            type="text"
                            placeholder="Search projects…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="admin-user-table">
                    <div className="admin-user-row admin-user-row-head" style={{ gridTemplateColumns: '80px 2fr 2fr 1.5fr 130px 80px' }}>
                        <span>Key</span>
                        <span>Name</span>
                        <span>Description</span>
                        <span>Lead</span>
                        <span>Created</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>

                    {loading && (
                        <div className="admin-user-row" style={{ gridTemplateColumns: '1fr' }}>
                            <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</span>
                        </div>
                    )}

                    {!loading && projects.length === 0 && (
                        <div className="admin-user-row" style={{ gridTemplateColumns: '1fr' }}>
                            <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                {search ? 'No projects match your search.' : 'No projects yet. Create one above.'}
                            </span>
                        </div>
                    )}

                    {!loading && projects.map((p) => (
                        <div key={p.id} className="admin-user-row" style={{ gridTemplateColumns: '80px 2fr 2fr 1.5fr 130px 80px' }}>
                            <span>
                                <span className="project-key-badge">{p.pkey}</span>
                            </span>
                            <span style={{ fontWeight: 600 }}>{p.pname}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }} title={p.description || ''}>
                                {p.description
                                    ? p.description.length > 50 ? p.description.slice(0, 50) + '…' : p.description
                                    : '—'}
                            </span>
                            <span style={{ fontSize: 13 }}>{p.lead || '—'}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(p.createdAt || p.created_at)}</span>
                            <span style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                <button
                                    className="sprint-action-btn edit"
                                    title="Edit"
                                    onClick={() => handleEditOpen(p)}
                                >
                                    <IoPencilOutline />
                                </button>
                                <button
                                    className="sprint-action-btn danger"
                                    title="Delete"
                                    onClick={() => handleDelete(p)}
                                >
                                    <IoTrashOutline />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Create Project Modal ── */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Project</h2>
                            <button className="modal-close" onClick={() => setShowCreate(false)}>
                                <IoCloseOutline />
                            </button>
                        </div>
                        <form className="modal-body" onSubmit={handleCreateSubmit}>
                            {createError && (
                                <div className="create-issue-error" style={{ marginBottom: 12 }}>{createError}</div>
                            )}

                            <div className="modal-field">
                                <label>Project Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={createForm.pname}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Marketing Website"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="modal-field">
                                <label>Project Key <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={createForm.pkey}
                                    onChange={(e) => {
                                        setKeyEdited(true);
                                        setCreateForm((f) => ({ ...f, pkey: e.target.value.toUpperCase() }));
                                    }}
                                    placeholder="e.g. MKT"
                                    maxLength={10}
                                    required
                                />
                                <span className="modal-field-hint">Unique identifier used in issue keys (auto-generated, editable)</span>
                            </div>

                            <div className="modal-field">
                                <label>Description</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="What is this project about?"
                                    rows={3}
                                />
                            </div>

                            <div className="modal-field">
                                <label>Project Lead</label>
                                <select
                                    value={createForm.lead}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, lead: e.target.value }))}
                                    className="modal-select"
                                >
                                    <option value="">No lead assigned</option>
                                    {userList.map((u) => (
                                        <option key={u.id} value={u.displayName || u.username}>
                                            {u.displayName || u.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="create-issue-actions" style={{ marginTop: 20 }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={createLoading}>
                                    {createLoading ? 'Creating…' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Project Modal ── */}
            {editProject && (
                <div className="modal-overlay" onClick={() => setEditProject(null)}>
                    <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Project</h2>
                            <button className="modal-close" onClick={() => setEditProject(null)}>
                                <IoCloseOutline />
                            </button>
                        </div>
                        <form className="modal-body" onSubmit={handleEditSubmit}>
                            {editError && (
                                <div className="create-issue-error" style={{ marginBottom: 12 }}>{editError}</div>
                            )}

                            <div className="modal-field">
                                <label>Project Key</label>
                                <input type="text" value={editProject.pkey} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                <span className="modal-field-hint">Project key cannot be changed after creation</span>
                            </div>

                            <div className="modal-field">
                                <label>Project Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={editForm.pname}
                                    onChange={(e) => setEditForm((f) => ({ ...f, pname: e.target.value }))}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="modal-field">
                                <label>Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className="modal-field">
                                <label>Project Lead</label>
                                <select
                                    value={editForm.lead}
                                    onChange={(e) => setEditForm((f) => ({ ...f, lead: e.target.value }))}
                                    className="modal-select"
                                >
                                    <option value="">No lead assigned</option>
                                    {userList.map((u) => (
                                        <option key={u.id} value={u.displayName || u.username}>
                                            {u.displayName || u.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="create-issue-actions" style={{ marginTop: 20 }}>
                                <button type="button" className="btn-secondary" onClick={() => setEditProject(null)}>
                                    Cancel
                                </button>
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
