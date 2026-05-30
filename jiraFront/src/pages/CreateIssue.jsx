import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, fetchIssueTypes, fetchPriorities, fetchUsers, createIssue } from '../services/issueService';
import { fetchSprints } from '../services/sprintService';
import { useProject } from '../context/ProjectContext';

const EMPTY_FORM = {
    projectId: '',
    issuetypeId: '',
    summary: '',
    description: '',
    priorityId: '',
    assigneeId: '',
    duedate: '',
    sprintId: '',
};

export default function CreateIssue() {
    const navigate = useNavigate();
    const { refreshIssues, refreshSprints } = useProject();

    const [form, setForm]           = useState(EMPTY_FORM);
    const [projects, setProjects]   = useState([]);
    const [issueTypes, setTypes]    = useState([]);
    const [priorities, setPrios]    = useState([]);
    const [users, setUsers]         = useState([]);
    const [sprints, setSprints]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState('');

    useEffect(() => {
        Promise.all([
            fetchProjects(),
            fetchIssueTypes(),
            fetchPriorities(),
            fetchUsers(),
        ])
            .then(([proj, types, prios, usr]) => {
                const projectList   = proj.data  || [];
                const typeList      = types.data  || [];
                const prioList      = prios.data  || [];
                const userList      = usr.data    || [];

                setProjects(projectList);
                setTypes(typeList);
                setPrios(prioList);
                setUsers(userList);

                const defaultProjectId = projectList[0]?.id ?? '';
                setForm(f => ({
                    ...f,
                    projectId:   defaultProjectId,
                    issuetypeId: typeList.find(t => t.pname === 'Task')?.id ?? typeList[0]?.id ?? '',
                    priorityId:  prioList.find(p => p.pname === 'Medium')?.id ?? prioList[0]?.id ?? '',
                }));

                if (defaultProjectId) {
                    fetchSprints(defaultProjectId)
                        .then(res => setSprints((res.data || []).filter(s => s.status !== 'COMPLETED')))
                        .catch(() => setSprints([]));
                }
            })
            .catch(() => setError('Failed to load form data. Is the server running?'))
            .finally(() => setLoading(false));
    }, []);

    /* reload sprints when project changes */
    useEffect(() => {
        if (!form.projectId) return;
        setSprints([]);
        setForm(f => ({ ...f, sprintId: '' }));
        fetchSprints(form.projectId)
            .then(res => setSprints((res.data || []).filter(s => s.status !== 'COMPLETED')))
            .catch(() => setSprints([]));
    }, [form.projectId]);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.summary.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            await createIssue({
                projectId:   Number(form.projectId),
                issuetypeId: Number(form.issuetypeId),
                summary:     form.summary.trim(),
                description: form.description || null,
                priorityId:  form.priorityId  ? Number(form.priorityId)  : null,
                assigneeId:  form.assigneeId  ? Number(form.assigneeId)  : null,
                duedate:     form.duedate     || null,
                sprintId:    form.sprintId    ? Number(form.sprintId)    : null,
            });
            await refreshIssues();
            await refreshSprints();
            navigate(-1);
        } catch (err) {
            setError(err.message || 'Failed to create issue');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="create-issue-page">
                <div className="create-issue-loader">Loading form data…</div>
            </div>
        );
    }

    return (
        <div className="create-issue-page">
            <div className="create-issue-header">
                <h1>Create Issue</h1>
            </div>

            <form className="create-issue-form" onSubmit={handleSubmit}>
                {error && <div className="create-issue-error">{error}</div>}

                <div className="create-issue-row">
                    <div className="create-issue-field">
                        <label>Project <span className="required">*</span></label>
                        <select value={form.projectId} onChange={set('projectId')} required>
                            {projects.length === 0 && <option value="">No projects found</option>}
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.pname}</option>
                            ))}
                        </select>
                    </div>

                    <div className="create-issue-field">
                        <label>Issue Type <span className="required">*</span></label>
                        <select value={form.issuetypeId} onChange={set('issuetypeId')} required>
                            {issueTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.pname}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="create-issue-field">
                    <label>Summary <span className="required">*</span></label>
                    <input
                        type="text"
                        value={form.summary}
                        onChange={set('summary')}
                        placeholder="What needs to be done?"
                        autoFocus
                        required
                    />
                </div>

                <div className="create-issue-field">
                    <label>Description</label>
                    <textarea
                        value={form.description}
                        onChange={set('description')}
                        placeholder="Add a description…"
                        rows={5}
                    />
                </div>

                <div className="create-issue-row">
                    <div className="create-issue-field">
                        <label>Priority</label>
                        <select value={form.priorityId} onChange={set('priorityId')}>
                            <option value="">None</option>
                            {priorities.map(p => (
                                <option key={p.id} value={p.id}>{p.pname}</option>
                            ))}
                        </select>
                    </div>

                    <div className="create-issue-field">
                        <label>Assignee</label>
                        <select value={form.assigneeId} onChange={set('assigneeId')}>
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.displayName || u.username}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="create-issue-row">
                    <div className="create-issue-field">
                        <label>Sprint</label>
                        <select value={form.sprintId} onChange={set('sprintId')}>
                            <option value="">Backlog (no sprint)</option>
                            {sprints.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.status === 'ACTIVE' ? '▶ ' : ''}{s.name}
                                    {s.status === 'ACTIVE' ? ' (Active)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="create-issue-field">
                        <label>Due Date</label>
                        <input
                            type="date"
                            value={form.duedate}
                            onChange={set('duedate')}
                        />
                    </div>
                </div>

                <div className="create-issue-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Creating…' : 'Create Issue'}
                    </button>
                </div>
            </form>
        </div>
    );
}
