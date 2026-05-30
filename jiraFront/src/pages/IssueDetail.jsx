import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchIssueById, updateIssueStatus, fetchComments, postComment,
    fetchSubtasks, createSubtask, linkSubtask,
    fetchIssueTypes, fetchPriorities, fetchUsers, fetchProjectIssues,
} from '../services/issueService';
import { typeIcons, priorityIcons } from '../components/IssueCard';
import {
    IoArrowBackOutline, IoChatbubbleOutline, IoPersonCircleOutline,
    IoAddOutline, IoLinkOutline, IoCloseOutline, IoSearchOutline,
    IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { useProject } from '../context/ProjectContext';

const STATUSES = ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'DONE'];

const statusClass = (s) => {
    if (s === 'TO DO')       return 'todo';
    if (s === 'IN PROGRESS') return 'inprogress';
    if (s === 'IN REVIEW')   return 'inreview';
    if (s === 'DONE')        return 'done';
    return 'todo';
};

const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const EMPTY_CREATE = { summary: '', issuetypeId: '', priorityId: '', assigneeId: '', description: '' };

export default function IssueDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateIssueStatus: ctxUpdateStatus } = useProject();

    const [issue, setIssue]           = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [status, setStatus]         = useState('');
    const [saving, setSaving]         = useState(false);
    const [comments, setComments]     = useState([]);
    const [commentText, setComment]   = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [commentErr, setCommentErr] = useState('');

    /* subtask state */
    const [subtasks, setSubtasks]             = useState([]);
    const [showCreate, setShowCreate]         = useState(false);
    const [showLink, setShowLink]             = useState(false);
    const [createForm, setCreateForm]         = useState(EMPTY_CREATE);
    const [creating, setCreating]             = useState(false);
    const [linking, setLinking]               = useState(false);
    const [subtaskErr, setSubtaskErr]         = useState('');
    const [issueTypes, setIssueTypes]         = useState([]);
    const [priorities, setPriorities]         = useState([]);
    const [users, setUsers]                   = useState([]);
    const [projectIssues, setProjectIssues]   = useState([]);
    const [linkSearch, setLinkSearch]         = useState('');
    const [selectedLink, setSelectedLink]     = useState(null);
    const linkSearchRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchIssueById(id), fetchComments(id), fetchSubtasks(id)])
            .then(([issueRes, commentsRes, subtasksRes]) => {
                setIssue(issueRes.data);
                setStatus(issueRes.data.status || 'TO DO');
                setComments(commentsRes.data || []);
                setSubtasks(subtasksRes.data || []);
            })
            .catch(() => setError('Issue not found or server error.'))
            .finally(() => setLoading(false));
    }, [id]);

    /* open create modal — lazily load lookup data */
    const openCreate = async () => {
        setSubtaskErr('');
        setCreateForm(EMPTY_CREATE);
        setShowCreate(true);
        if (issueTypes.length === 0) {
            const [types, prios, usrs] = await Promise.all([
                fetchIssueTypes(), fetchPriorities(), fetchUsers(),
            ]);
            setIssueTypes(types.data || []);
            setPriorities(prios.data || []);
            setUsers(usrs.data || []);
        }
    };

    /* open link modal — load project issues */
    const openLink = async () => {
        setSubtaskErr('');
        setLinkSearch('');
        setSelectedLink(null);
        setShowLink(true);
        if (issue?.projectId) {
            const res = await fetchProjectIssues(issue.projectId);
            setProjectIssues(
                (res.data || []).filter(
                    (i) => String(i.id) !== String(id) &&
                           !subtasks.some((s) => s.id === i.id)
                )
            );
        }
        setTimeout(() => linkSearchRef.current?.focus(), 60);
    };

    const handleStatusChange = async (newStatus) => {
        setSaving(true);
        try {
            await updateIssueStatus(id, newStatus);
            setStatus(newStatus);
            ctxUpdateStatus(id, newStatus);
        } catch { /* keep existing */ }
        finally { setSaving(false); }
    };

    const handleComment = async () => {
        const text = commentText.trim();
        if (!text) return;
        setSubmitting(true);
        setCommentErr('');
        try {
            const res = await postComment(id, text);
            setComments((prev) => [...prev, res.data]);
            setComment('');
        } catch {
            setCommentErr('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createForm.summary.trim()) return setSubtaskErr('Summary is required.');
        setCreating(true);
        setSubtaskErr('');
        try {
            await createSubtask(id, {
                summary:     createForm.summary.trim(),
                description: createForm.description.trim() || undefined,
                issuetypeId: createForm.issuetypeId  || undefined,
                priorityId:  createForm.priorityId   || undefined,
                assigneeId:  createForm.assigneeId   || undefined,
            });
            const res = await fetchSubtasks(id);
            setSubtasks(res.data || []);
            setShowCreate(false);
        } catch (err) {
            setSubtaskErr(err.message || 'Failed to create sub-task.');
        } finally {
            setCreating(false);
        }
    };

    const handleLink = async () => {
        if (!selectedLink) return setSubtaskErr('Select an issue to link.');
        setLinking(true);
        setSubtaskErr('');
        try {
            await linkSubtask(selectedLink.id, Number(id));
            const res = await fetchSubtasks(id);
            setSubtasks(res.data || []);
            setShowLink(false);
        } catch (err) {
            setSubtaskErr(err.message || 'Failed to link issue.');
        } finally {
            setLinking(false);
        }
    };

    const filteredLinks = projectIssues.filter((i) => {
        const q = linkSearch.toLowerCase();
        return (
            (i.pkey  || '').toLowerCase().includes(q) ||
            (i.summary || '').toLowerCase().includes(q)
        );
    });

    if (loading) return <div className="issue-detail-loading">Loading issue…</div>;
    if (error)   return <div className="issue-detail-error">{error}</div>;
    if (!issue)  return null;

    const assigneeName  = issue.assigneeDisplayName || issue.assigneeUsername || null;
    const reporterName  = issue.reporterDisplayName || issue.reporterUsername || null;
    const issueType     = issue.type     || 'Task';
    const issuePriority = issue.priority || 'Medium';
    const isStory       = issueType.toLowerCase() === 'story';

    return (
        <div className="issue-detail-page">

            {/* breadcrumb */}
            <div className="issue-detail-nav">
                <button className="issue-detail-back" onClick={() => navigate(-1)}>
                    <IoArrowBackOutline /> Back
                </button>
                <span className="issue-detail-breadcrumb">
                    {issue.projectName || 'Project'}
                    <span> / </span>
                    <span className="issue-key">{issue.pkey}</span>
                </span>
            </div>

            <div className="issue-detail-body">

                {/* ── main column ── */}
                <div className="issue-detail-main">
                    <div className="issue-detail-type-row">
                        <div className={`issue-type-icon ${issueType.toLowerCase()}`}>
                            {typeIcons[issueType]}
                        </div>
                        <span className="issue-key">{issue.pkey}</span>
                    </div>

                    <h1 className="issue-detail-title">{issue.summary}</h1>

                    <div className="issue-detail-section">
                        <h3>Description</h3>
                        <p className="issue-detail-description">
                            {issue.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* ── Sub-tasks (Story only) ── */}
                    {isStory && (
                        <div className="issue-detail-section subtask-section">
                            <div className="subtask-header">
                                <h3>Child Issues</h3>
                                <div className="subtask-actions">
                                    <button className="subtask-btn" onClick={openCreate} title="Create sub-task">
                                        <IoAddOutline /> Create
                                    </button>
                                    <button className="subtask-btn subtask-btn-link" onClick={openLink} title="Link existing issue">
                                        <IoLinkOutline /> Link Issue
                                    </button>
                                </div>
                            </div>

                            {subtasks.length === 0 ? (
                                <p className="subtask-empty">No child issues yet.</p>
                            ) : (
                                <div className="subtask-list">
                                    {subtasks.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="subtask-item"
                                            onClick={() => navigate(`/issues/${sub.id}`)}
                                        >
                                            <div className={`subtask-type-dot ${(sub.type || 'task').toLowerCase()}`} />
                                            <span className="subtask-key">{sub.pkey}</span>
                                            <span className="subtask-summary">{sub.summary}</span>
                                            <span className={`subtask-status status-badge--${statusClass(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                            {(sub.assigneeDisplayName || sub.assigneeUsername) && (
                                                <span className="subtask-assignee">
                                                    {(sub.assigneeDisplayName || sub.assigneeUsername).charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* comments */}
                    <div className="issue-detail-section">
                        <h3>
                            <IoChatbubbleOutline style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            Comments {comments.length > 0 && <span className="comment-count">({comments.length})</span>}
                        </h3>

                        {comments.length === 0 && (
                            <p className="no-comments">No comments yet. Be the first to comment.</p>
                        )}

                        <div className="comment-list">
                            {comments.map((c) => {
                                const author = c.authorDisplayName || c.authorUsername || 'Unknown';
                                return (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-avatar"><IoPersonCircleOutline /></div>
                                        <div className="comment-body">
                                            <div className="comment-meta">
                                                <span className="comment-author">{author}</span>
                                                <span className="comment-date">{fmt(c.created)}</span>
                                            </div>
                                            <p className="comment-text">{c.actionbody}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="issue-detail-comment-input">
                            <input
                                value={commentText}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !submitting && handleComment()}
                                placeholder="Add a comment…"
                                disabled={submitting}
                            />
                            <button className="btn-primary" onClick={handleComment} disabled={submitting}>
                                {submitting ? 'Posting…' : 'Send'}
                            </button>
                        </div>
                        {commentErr && <p className="comment-error">{commentErr}</p>}
                    </div>
                </div>

                {/* ── sidebar ── */}
                <div className="issue-detail-sidebar">
                    <div className="issue-detail-field">
                        <label>Status</label>
                        <select
                            className={`status-select status-select--${statusClass(status)}`}
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={saving}
                        >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="issue-detail-field">
                        <label>Priority</label>
                        <div className="issue-detail-value">
                            {priorityIcons[issuePriority]}
                            <span>{issuePriority}</span>
                        </div>
                    </div>

                    <div className="issue-detail-field">
                        <label>Assignee</label>
                        <div className="issue-detail-value">
                            {assigneeName ? (
                                <>
                                    <span className="assignee-name-small">{assigneeName.charAt(0).toUpperCase()}</span>
                                    <span>{assigneeName}</span>
                                </>
                            ) : <span className="muted">Unassigned</span>}
                        </div>
                    </div>

                    <div className="issue-detail-field">
                        <label>Reporter</label>
                        <div className="issue-detail-value">
                            {reporterName ? (
                                <>
                                    <span className="assignee-name-small">{reporterName.charAt(0).toUpperCase()}</span>
                                    <span>{reporterName}</span>
                                </>
                            ) : <span className="muted">—</span>}
                        </div>
                    </div>

                    <div className="issue-detail-field">
                        <label>Project</label>
                        <div className="issue-detail-value">{issue.projectName || '—'}</div>
                    </div>

                    {issue.duedate && (
                        <div className="issue-detail-field">
                            <label>Due Date</label>
                            <div className="issue-detail-value">{fmt(issue.duedate)}</div>
                        </div>
                    )}

                    <div className="issue-detail-field">
                        <label>Created</label>
                        <div className="issue-detail-value muted">{fmt(issue.created)}</div>
                    </div>

                    <div className="issue-detail-field">
                        <label>Updated</label>
                        <div className="issue-detail-value muted">{fmt(issue.updated)}</div>
                    </div>
                </div>
            </div>

            {/* ── Create Sub-task Modal ── */}
            {showCreate && (
                <div className="subtask-modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="subtask-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="subtask-modal-header">
                            <h2><IoAddOutline /> Create Sub-task</h2>
                            <button className="subtask-modal-close" onClick={() => setShowCreate(false)}>
                                <IoCloseOutline />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="subtask-modal-body">
                            {subtaskErr && <div className="create-issue-error">{subtaskErr}</div>}

                            <div className="create-issue-field">
                                <label>Summary <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={createForm.summary}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, summary: e.target.value }))}
                                    placeholder="Brief description of the sub-task"
                                    autoFocus
                                />
                            </div>

                            <div className="create-issue-row">
                                <div className="create-issue-field">
                                    <label>Type</label>
                                    <select
                                        value={createForm.issuetypeId}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, issuetypeId: e.target.value }))}
                                    >
                                        <option value="">— Select type —</option>
                                        {issueTypes.map((t) => (
                                            <option key={t.id} value={t.id}>{t.pname}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="create-issue-field">
                                    <label>Priority</label>
                                    <select
                                        value={createForm.priorityId}
                                        onChange={(e) => setCreateForm((f) => ({ ...f, priorityId: e.target.value }))}
                                    >
                                        <option value="">— Select priority —</option>
                                        {priorities.map((p) => (
                                            <option key={p.id} value={p.id}>{p.pname}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="create-issue-field">
                                <label>Assignee</label>
                                <select
                                    value={createForm.assigneeId}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, assigneeId: e.target.value }))}
                                >
                                    <option value="">— Unassigned —</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.displayName || u.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="create-issue-field">
                                <label>Description</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Optional details…"
                                    rows={3}
                                />
                            </div>

                            <div className="subtask-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={creating}>
                                    {creating ? 'Creating…' : 'Create Sub-task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Link Existing Issue Modal ── */}
            {showLink && (
                <div className="subtask-modal-overlay" onClick={() => setShowLink(false)}>
                    <div className="subtask-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="subtask-modal-header">
                            <h2><IoLinkOutline /> Link Existing Issue</h2>
                            <button className="subtask-modal-close" onClick={() => setShowLink(false)}>
                                <IoCloseOutline />
                            </button>
                        </div>

                        <div className="subtask-modal-body">
                            {subtaskErr && <div className="create-issue-error">{subtaskErr}</div>}

                            <div className="subtask-link-search">
                                <IoSearchOutline className="subtask-search-icon" />
                                <input
                                    ref={linkSearchRef}
                                    type="text"
                                    value={linkSearch}
                                    onChange={(e) => setLinkSearch(e.target.value)}
                                    placeholder="Search by key or summary…"
                                />
                            </div>

                            <div className="subtask-link-list">
                                {filteredLinks.length === 0 && (
                                    <p className="subtask-empty">No issues found.</p>
                                )}
                                {filteredLinks.map((i) => (
                                    <div
                                        key={i.id}
                                        className={`subtask-link-item${selectedLink?.id === i.id ? ' selected' : ''}`}
                                        onClick={() => setSelectedLink(i)}
                                    >
                                        <span className="subtask-key">{i.pkey}</span>
                                        <span className="subtask-link-summary">{i.summary}</span>
                                        <span className={`subtask-status status-badge--${statusClass(i.status)}`}>
                                            {i.status}
                                        </span>
                                        {selectedLink?.id === i.id && (
                                            <IoCheckmarkCircleOutline className="subtask-link-check" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="subtask-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowLink(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleLink}
                                    disabled={!selectedLink || linking}
                                >
                                    {linking ? 'Linking…' : 'Link as Sub-task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
