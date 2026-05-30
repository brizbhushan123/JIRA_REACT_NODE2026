import { useMemo } from 'react';
import {
    IoCheckmarkCircleOutline,
    IoPeopleOutline,
    IoPodiumOutline,
    IoStatsChartOutline,
} from 'react-icons/io5';
import { useProject } from '../../context/ProjectContext';
import { useAppMeta } from '../../context/AppMetaContext';

export default function Admin() {
    const { getProjectIssues } = useProject();
    const { projects, users } = useAppMeta();
    const issues = getProjectIssues();

    const usersList = useMemo(() => Array.isArray(users) ? users : (users?.users || []), [users]);

    const metrics = useMemo(() => {
        const doneIssues = issues.filter((issue) => issue.status === 'DONE').length;
        const activeUsers = usersList.filter((user) => user.active !== false).length;
        const highPriority = issues.filter((issue) =>
            ['High', 'Highest'].includes(issue.priority)
        ).length;
        const assignedIssues = issues.filter((issue) => issue.assigneeId).length;

        return {
            totalUsers: Array.isArray(users) ? users.length : (users?.total || 0),
            activeUsers,
            projects: projects.length,
            totalIssues: issues.length,
            doneIssues,
            openIssues: Math.max(issues.length - doneIssues, 0),
            highPriority,
            assignedRate: issues.length ? Math.round((assignedIssues / issues.length) * 100) : 0,
        };
    }, [issues, projects.length, users, usersList]);

    const statusCounts = useMemo(() => {
        const counts = {
            'TO DO': 0,
            'IN PROGRESS': 0,
            'IN REVIEW': 0,
            DONE: 0,
        };
        issues.forEach((issue) => {
            counts[issue.status] = (counts[issue.status] || 0) + 1;
        });
        return counts;
    }, [issues]);

    const topAssignees = useMemo(() => {
        return usersList
            .map((user) => ({
                ...user,
                issueCount: issues.filter((issue) => String(issue.assigneeId) === String(user.id)).length,
            }))
            .sort((a, b) => b.issueCount - a.issueCount)
            .slice(0, 5);
    }, [issues, usersList]);

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Admin Panel</h1>
                    <p>Manage user access and monitor project activity.</p>
                </div>
            </div>

            <section className="admin-metrics">
                <Metric icon={<IoPeopleOutline />} label="Users" value={metrics.totalUsers} detail={`${metrics.activeUsers} active`} />
                <Metric icon={<IoPodiumOutline />} label="Projects" value={metrics.projects} detail="Available workspaces" />
                <Metric icon={<IoStatsChartOutline />} label="Issues" value={metrics.totalIssues} detail={`${metrics.openIssues} open`} />
                <Metric icon={<IoCheckmarkCircleOutline />} label="Done" value={metrics.doneIssues} detail={`${metrics.assignedRate}% assigned`} />
            </section>

            <div className="admin-grid admin-grid-single">
                <section className="admin-panel">
                    <div className="admin-panel-title">
                        <IoStatsChartOutline />
                        <h2>Data Dashboard</h2>
                    </div>

                    <div className="admin-dashboard-list">
                        <DashboardRow label="High priority work" value={metrics.highPriority} />
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <DashboardRow key={status} label={status} value={count} />
                        ))}
                    </div>
                </section>

                <section className="admin-panel">
                    <div className="admin-panel-title">
                        <IoPeopleOutline />
                        <h2>User Directory</h2>
                    </div>

                    <div className="admin-user-table">
                        <div className="admin-user-row admin-user-row-head" style={{ gridTemplateColumns: '1.5fr 2fr 100px 140px' }}>
                            <span>User</span>
                            <span>Email</span>
                            <span>Status</span>
                            <span style={{ textAlign: 'right' }}>Assigned Issues</span>
                        </div>
                        {topAssignees.map((user) => (
                            <div className="admin-user-row" key={user.id} style={{ gridTemplateColumns: '1.5fr 2fr 100px 140px' }}>
                                <span className="admin-user-name">
                                    <span className="assignee-name-small">
                                        {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                                    </span>
                                    {user.displayName || user.username}
                                </span>
                                <span>{user.email || '-'}</span>
                                <span>
                                    <span className={`admin-status ${user.active === false ? 'inactive' : ''}`}>
                                        {user.active === false ? 'Inactive' : 'Active'}
                                    </span>
                                </span>
                                <span style={{ textAlign: 'right' }}>{user.issueCount}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

function Metric({ icon, label, value, detail }) {
    return (
        <div className="admin-metric">
            <div className="admin-metric-icon">{icon}</div>
            <div>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
            </div>
        </div>
    );
}

function DashboardRow({ label, value }) {
    return (
        <div className="admin-dashboard-row">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}
