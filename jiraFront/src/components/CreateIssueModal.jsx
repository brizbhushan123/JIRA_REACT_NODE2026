import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAppMeta } from '../context/AppMetaContext';
import { IoCloseOutline } from 'react-icons/io5';

export default function CreateIssueModal({ onClose }) {
    const { addIssue, sprints } = useProject();
    const { users, currentProjectId } = useAppMeta();
    const projectSprints = sprints.filter(
        (s) => s.projectId === currentProjectId
    );

    const [form, setForm] = useState({
        summary: '',
        description: '',
        type: 'Task',
        priority: 'Medium',
        assigneeId: '',
        sprintId: '',
        storyPoints: '',
    });

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.summary.trim()) return;
        addIssue({
            ...form,
            status: 'TO DO',
            storyPoints: form.storyPoints ? parseInt(form.storyPoints) : null,
            assigneeId: form.assigneeId || null,
            sprintId: form.sprintId || null,
            reporterId: 'user-1',
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: 560 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Create Issue</h2>
                    <button className="modal-close" onClick={onClose}>
                        <IoCloseOutline />
                    </button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="modal-field">
                        <label>Issue Type *</label>
                        <select
                            className="filter-select"
                            style={{ width: '100%' }}
                            value={form.type}
                            onChange={handleChange('type')}
                        >
                            <option value="Story">Story</option>
                            <option value="Bug">Bug</option>
                            <option value="Task">Task</option>
                            <option value="Epic">Epic</option>
                        </select>
                    </div>

                    <div className="modal-field">
                        <label>Summary *</label>
                        <input
                            type="text"
                            value={form.summary}
                            onChange={handleChange('summary')}
                            placeholder="What needs to be done?"
                            autoFocus
                        />
                    </div>

                    <div className="modal-field">
                        <label>Description</label>
                        <textarea
                            value={form.description}
                            onChange={handleChange('description')}
                            placeholder="Add a description…"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="modal-field">
                            <label>Priority</label>
                            <select
                                className="filter-select"
                                style={{ width: '100%' }}
                                value={form.priority}
                                onChange={handleChange('priority')}
                            >
                                <option value="Highest">Highest</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                                <option value="Lowest">Lowest</option>
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>Story Points</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={form.storyPoints}
                                onChange={handleChange('storyPoints')}
                                placeholder="e.g. 5"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="modal-field">
                            <label>Assignee</label>
                            <select
                                className="filter-select"
                                style={{ width: '100%' }}
                                value={form.assigneeId}
                                onChange={handleChange('assigneeId')}
                            >
                                <option value="">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>Sprint</label>
                            <select
                                className="filter-select"
                                style={{ width: '100%' }}
                                value={form.sprintId}
                                onChange={handleChange('sprintId')}
                            >
                                <option value="">Backlog</option>
                                {projectSprints.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="modal-submit-btn">
                        Create Issue
                    </button>
                </form>
            </div>
        </div>
    );
}
