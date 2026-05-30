import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IoChevronForward,
    IoAddOutline,
    IoPlayOutline,
    IoCheckmarkDoneOutline,
    IoTrashOutline,
    IoPencilOutline,
    IoCloseOutline,
    IoRocketOutline,
} from 'react-icons/io5';
import { useProject, useFilteredIssues } from '../context/ProjectContext';
import { useAppMeta } from '../context/AppMetaContext';
import Filters from '../components/Filters';
import { typeIcons, priorityIcons } from '../components/IssueCard';

const statusClass = (s) => {
    if (s === 'TO DO')       return 'todo';
    if (s === 'IN PROGRESS') return 'inprogress';
    if (s === 'IN REVIEW')   return 'inreview';
    if (s === 'DONE')        return 'done';
    return 'todo';
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

export default function Backlog() {
    const navigate = useNavigate();
    const {
        sprints, issues, loadingIssues,
        createSprint, updateSprint, startSprint, completeSprint, deleteSprint,
        addIssuesToSprint, removeIssueFromSprint,
    } = useProject();
    const { getUser } = useAppMeta();

    const allFilteredIssues = useFilteredIssues();

    /* sprint section open/close state */
    const [openSections, setOpenSections] = useState({});
    const toggleSection = (id) => setOpenSections((s) => ({ ...s, [id]: !s[id] }));

    /* create sprint modal */
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    /* edit sprint modal */
    const [editSprint, setEditSprint] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    /* move issue to sprint modal */
    const [moveIssue, setMoveIssue] = useState(null);
    const [moveLoading, setMoveLoading] = useState(false);

    /* action error */
    const [actionError, setActionError] = useState('');

    /* which issues belong to which sprints */
    const sprintIssueIds = new Set(sprints.flatMap((s) => s.issueIds || []));
    const backlogIssues = allFilteredIssues.filter((i) => !sprintIssueIds.has(Number(i.id)));

    const getSprintIssues = (sprint) =>
        (sprint.issueIds || [])
            .map((id) => allFilteredIssues.find((i) => String(i.id) === String(id)))
            .filter(Boolean);

    const activeSprint = sprints.find((s) => s.status === 'ACTIVE');

    /* ── handlers ── */
    const handleCreateSprint = async (e) => {
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

    const handleEditOpen = (s, e) => {
        e.stopPropagation();
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

    const handleStart = async (s, e) => {
        e.stopPropagation();
        setActionError('');
        try { await startSprint(s.id); } catch (err) { setActionError(err.message); }
    };

    const handleComplete = async (s, e) => {
        e.stopPropagation();
        if (!window.confirm(`Complete sprint "${s.name}"? All open issues will move to backlog.`)) return;
        setActionError('');
        try { await completeSprint(s.id); } catch (err) { setActionError(err.message); }
    };

    const handleDelete = async (s, e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete sprint "${s.name}"?`)) return;
        setActionError('');
        try { await deleteSprint(s.id); } catch (err) { setActionError(err.message); }
    };

    const handleRemoveIssue = async (sprintId, issueId, e) => {
        e.stopPropagation();
        setActionError('');
        try { await removeIssueFromSprint(sprintId, issueId); } catch (err) { setActionError(err.message); }
    };

    const handleMoveToSprint = async (targetSprintId) => {
        if (!moveIssue) return;
        setMoveLoading(true);
        setActionError('');
        try {
            await addIssuesToSprint(targetSprintId, [Number(moveIssue.id)]);
            setMoveIssue(null);
        } catch (err) {
            setActionError(err.message);
        } finally {
            setMoveLoading(false);
        }
    };

    /* ── render helpers ── */
    const renderIssueRow = (issue, sprintId = null) => {
        const assignee = issue.assigneeId ? getUser(issue.assigneeId) : null;
        const assigneeName = assignee ? (assignee.displayName || assignee.username) : null;

        return (
            <div key={issue.id} className="backlog-issue-row" onClick={() => navigate(`/issues/${issue.id}`)}>
                <div className={`issue-type-icon ${(issue.type || 'task').toLowerCase()}`}>
                    {typeIcons[issue.type] || typeIcons['Task']}
                </div>
                <span className="issue-key">{issue.key || issue.pkey}</span>
                <span className="backlog-issue-summary">{issue.summary}</span>
                <div className="backlog-issue-meta">
                    <span className="priority-indicator" title={issue.priority}>
                        {priorityIcons[issue.priority]}
                    </span>
                    <span className={`status-badge ${statusClass(issue.status)}`}>{issue.status}</span>
                    {assigneeName
                        ? <span className="assignee-name-small" title={assigneeName}>{assigneeName.charAt(0).toUpperCase()}</span>
                        : <div className="assignee-placeholder" title="Unassigned">?</div>
                    }
                    {sprintId
                        ? (
                            <button
                                className="backlog-issue-action-btn"
                                title="Remove from sprint"
                                onClick={(e) => handleRemoveIssue(sprintId, issue.id, e)}
                            >
                                <IoCloseOutline />
                            </button>
                        ) : (
                            <button
                                className="backlog-issue-action-btn"
                                title="Move to sprint"
                                onClick={(e) => { e.stopPropagation(); setMoveIssue(issue); }}
                                disabled={sprints.filter((s) => s.status !== 'COMPLETED').length === 0}
                            >
                                <IoRocketOutline />
                            </button>
                        )
                    }
                </div>
            </div>
        );
    };

    const visibleSprints = sprints.filter((s) => s.status !== 'COMPLETED');

    return (
        <div className="backlog-page">
            <div className="backlog-page-header">
                <h1>My open issues</h1>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={() => setShowCreate(true)}>
                    <IoAddOutline /> Create Sprint
                </button>
            </div>

            <Filters />

            {actionError && (
                <div className="create-issue-error" style={{ marginBottom: 12 }}>{actionError}</div>
            )}

            {loadingIssues && <div className="empty-state"><p>Loading…</p></div>}

            {!loadingIssues && (
                <>
                    {visibleSprints.map((s) => {
                        const isOpen = openSections[s.id] !== false;
                        const sprintIssues = getSprintIssues(s);
                        const statusKey = s.status === 'ACTIVE' ? 'active' : s.status === 'COMPLETED' ? 'completed' : 'future';
                        const startD = fmtDate(s.startDate);
                        const endD = fmtDate(s.endDate);

                        return (
                            <div key={s.id} className="sprint-section">
                                <div className="sprint-header" onClick={() => toggleSection(s.id)}>
                                    <div className="sprint-header-left">
                                        <IoChevronForward className={`sprint-chevron ${isOpen ? 'open' : ''}`} />
                                        <span className="sprint-name">{s.name}</span>
                                        <span className={`sprint-status ${statusKey}`}>{s.status}</span>
                                        {(startD || endD) && (
                                            <span className="sprint-dates">
                                                {startD && endD ? `${startD} – ${endD}` : startD || endD}
                                            </span>
                                        )}
                                        {s.goal && <span className="sprint-goal-chip" title={s.goal}>Goal: {s.goal}</span>}
                                    </div>

                                    <div className="sprint-header-right">
                                        <span className="sprint-issue-count">{sprintIssues.length} issue{sprintIssues.length !== 1 ? 's' : ''}</span>

                                        {s.status === 'PLANNING' && (
                                            <>
                                                <button className="sprint-action-btn start" title="Start sprint" onClick={(e) => handleStart(s, e)}>
                                                    <IoPlayOutline /> Start
                                                </button>
                                                <button className="sprint-action-btn edit" title="Edit sprint" onClick={(e) => handleEditOpen(s, e)}>
                                                    <IoPencilOutline />
                                                </button>
                                                <button className="sprint-action-btn danger" title="Delete sprint" onClick={(e) => handleDelete(s, e)}>
                                                    <IoTrashOutline />
                                                </button>
                                            </>
                                        )}
                                        {s.status === 'ACTIVE' && (
                                            <>
                                                <button className="sprint-action-btn complete" title="Complete sprint" onClick={(e) => handleComplete(s, e)}>
                                                    <IoCheckmarkDoneOutline /> Complete
                                                </button>
                                                <button className="sprint-action-btn edit" title="Edit sprint" onClick={(e) => handleEditOpen(s, e)}>
                                                    <IoPencilOutline />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="sprint-issues">
                                        {sprintIssues.length === 0 && (
                                            <div className="empty-state" style={{ padding: 20 }}>
                                                <p>No issues in this sprint. Move issues from the backlog.</p>
                                            </div>
                                        )}
                                        {sprintIssues.map((issue) => renderIssueRow(issue, s.id))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Backlog section */}
                    <div className="sprint-section">
                        <div className="sprint-header" onClick={() => toggleSection('backlog')}>
                            <div className="sprint-header-left">
                                <IoChevronForward className={`sprint-chevron ${openSections['backlog'] !== false ? 'open' : ''}`} />
                                <span className="sprint-name">Backlog</span>
                            </div>
                            <span className="sprint-issue-count">{backlogIssues.length} issue{backlogIssues.length !== 1 ? 's' : ''}</span>
                        </div>

                        {openSections['backlog'] !== false && (
                            <div className="sprint-issues">
                                {backlogIssues.length === 0 && (
                                    <div className="empty-state" style={{ padding: 20 }}>
                                        <p>All issues are assigned to a sprint.</p>
                                    </div>
                                )}
                                {backlogIssues.map((issue) => renderIssueRow(issue, null))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Create Sprint Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create Sprint</h2>
                            <button className="modal-close" onClick={() => setShowCreate(false)}><IoCloseOutline /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleCreateSprint}>
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

            {/* Edit Sprint Modal */}
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

            {/* Move to Sprint Modal */}
            {moveIssue && (
                <div className="modal-overlay" onClick={() => setMoveIssue(null)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Move to Sprint</h2>
                            <button className="modal-close" onClick={() => setMoveIssue(null)}><IoCloseOutline /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                Move <strong>{moveIssue.key || moveIssue.pkey}</strong> to:
                            </p>
                            <div className="sprint-pick-list">
                                {sprints.filter((s) => s.status !== 'COMPLETED').map((s) => (
                                    <button
                                        key={s.id}
                                        className="sprint-pick-item"
                                        disabled={moveLoading}
                                        onClick={() => handleMoveToSprint(s.id)}
                                    >
                                        <span className={`sprint-status ${s.status === 'ACTIVE' ? 'active' : 'future'}`}>{s.status}</span>
                                        <span>{s.name}</span>
                                    </button>
                                ))}
                                {sprints.filter((s) => s.status !== 'COMPLETED').length === 0 && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active or planning sprints.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
