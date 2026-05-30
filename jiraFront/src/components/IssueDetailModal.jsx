import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAppMeta } from '../context/AppMetaContext';
import { typeIcons, priorityIcons } from './IssueCard';
import { IoCloseOutline, IoChatbubbleOutline } from 'react-icons/io5';

export default function IssueDetailModal({ issue, onClose }) {
    const { addComment, updateIssue, sprints } = useProject();
    const { getUser, users } = useAppMeta();
    const [commentText, setCommentText] = useState('');
    const assignee = issue.assigneeId ? getUser(issue.assigneeId) : null;
    const reporter = issue.reporterId ? getUser(issue.reporterId) : null;

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        addComment(issue.id, commentText.trim(), 'user-1');
        setCommentText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAddComment();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'TO DO': return 'todo';
            case 'IN PROGRESS': return 'inprogress';
            case 'IN REVIEW': return 'inreview';
            case 'DONE': return 'done';
            default: return 'todo';
        }
    };

    const sprint = issue.sprintId
        ? sprints.find((s) => s.id === issue.sprintId)
        : null;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`issue-type-icon ${issue.type.toLowerCase()}`}>
                            {typeIcons[issue.type]}
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
                            {issue.key}
                        </span>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoCloseOutline />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="modal-body-grid">
                        <div className="modal-main">
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
                                {issue.summary}
                            </h2>

                            <div className="modal-field">
                                <label>Description</label>
                                <div className="detail-description">
                                    {issue.description || 'No description provided.'}
                                </div>
                            </div>

                            {issue.labels && issue.labels.length > 0 && (
                                <div className="modal-field">
                                    <label>Labels</label>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {issue.labels.map((l) => (
                                            <span key={l} className="label-tag">{l}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="detail-comments">
                                <h3>
                                    <IoChatbubbleOutline />
                                    Comments ({issue.comments.length})
                                </h3>
                                {issue.comments.map((c) => {
                                    const author = getUser(c.authorId);
                                    return (
                                        <div key={c.id} className="comment-item">
                                            <img
                                                className="comment-avatar"
                                                src={author?.avatarUrl || 'https://i.pravatar.cc/150?u=unknown'}
                                                alt={author?.name}
                                            />
                                            <div className="comment-body">
                                                <div className="comment-author">{author?.name || 'Unknown'}</div>
                                                <div className="comment-time">{formatDate(c.createdAt)}</div>
                                                <div className="comment-text">{c.text}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="comment-input-area">
                                    <input
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Add a comment…"
                                    />
                                    <button className="comment-submit-btn" onClick={handleAddComment}>
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-sidebar-section">
                            <div className="modal-field">
                                <label>Status</label>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                    value={issue.status}
                                    onChange={(e) => updateIssue(issue.id, { status: e.target.value })}
                                >
                                    <option value="TO DO">TO DO</option>
                                    <option value="IN PROGRESS">IN PROGRESS</option>
                                    <option value="IN REVIEW">IN REVIEW</option>
                                    <option value="DONE">DONE</option>
                                </select>
                            </div>

                            <div className="modal-field">
                                <label>Assignee</label>
                                <div className="settings-value">
                                    {assignee ? (
                                        <>
                                            <img
                                                src={assignee.avatarUrl}
                                                alt={assignee.name}
                                                style={{ width: 24, height: 24, borderRadius: '50%' }}
                                            />
                                            {assignee.name}
                                        </>
                                    ) : (
                                        'Unassigned'
                                    )}
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>Reporter</label>
                                <div className="settings-value">
                                    {reporter ? (
                                        <>
                                            <img
                                                src={reporter.avatarUrl}
                                                alt={reporter.name}
                                                style={{ width: 24, height: 24, borderRadius: '50%' }}
                                            />
                                            {reporter.name}
                                        </>
                                    ) : (
                                        'Unknown'
                                    )}
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>Priority</label>
                                <div className="settings-value">
                                    {priorityIcons[issue.priority]}
                                    {issue.priority}
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>Story Points</label>
                                <div className="modal-field-value">
                                    {issue.storyPoints || '—'}
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>Sprint</label>
                                <div className="modal-field-value">
                                    {sprint ? sprint.name : 'Backlog'}
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>Created</label>
                                <div className="modal-field-value" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {formatDate(issue.createdAt)}
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>Updated</label>
                                <div className="modal-field-value" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {formatDate(issue.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
