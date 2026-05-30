import { useAppMeta } from '../context/AppMetaContext';

export default function Settings() {
    const { currentProject, users } = useAppMeta();

    return (
        <div className="settings-page">
            <h1>Project Settings</h1>

            <div className="settings-card">
                <h2>Details</h2>
                <div className="settings-row">
                    <span className="settings-label">Name</span>
                    <span className="settings-value">{currentProject?.pname || '—'}</span>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Key</span>
                    <span className="settings-value">
                        <span className="label-tag" style={{ fontSize: 12 }}>
                            {currentProject?.pkey || '—'}
                        </span>
                    </span>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Description</span>
                    <span className="settings-value" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {currentProject?.description || '—'}
                    </span>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Lead</span>
                    <span className="settings-value">{currentProject?.lead || '—'}</span>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Created</span>
                    <span className="settings-value" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {currentProject?.createdAt
                            ? new Date(currentProject.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                    </span>
                </div>
            </div>

            <div className="settings-card">
                <h2>Team Members</h2>
                {users.length === 0 && (
                    <div className="settings-row">
                        <span className="settings-value" style={{ color: 'var(--text-muted)' }}>No members found</span>
                    </div>
                )}
                {users.map((u) => (
                    <div key={u.id} className="settings-row">
                        <span className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                                className="assignee-name-small"
                                style={{ width: 28, height: 28, fontSize: 13 }}
                            >
                                {(u.displayName || u.username || '?').charAt(0).toUpperCase()}
                            </span>
                            {u.displayName || u.username}
                        </span>
                        <span className="settings-value" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            {u.email || '—'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
