import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { fetchProjects, fetchProjectIssues, fetchUsers } from '../services/issueService';
import { fetchSprints } from '../services/sprintService';
import {
    MdDashboard, MdAssignment, MdCheckCircle, MdWarning,
    MdRocketLaunch, MdPeople,
} from 'react-icons/md';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend,
);

const STATUS_MAP = {
    'DONE':        { label: 'Done',        cls: 'done' },
    'IN PROGRESS': { label: 'In Progress', cls: 'inprogress' },
    'IN REVIEW':   { label: 'In Review',   cls: 'inreview' },
    'TO DO':       { label: 'To Do',       cls: 'todo' },
};

const PRIORITY_COLORS = {
    highest: '#ff5630',
    high:    '#ff8b00',
    medium:  '#ffab00',
    low:     '#36b37e',
    lowest:  '#6b7a99',
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [projectsRes, usersRes] = await Promise.all([
                    fetchProjects(),
                    fetchUsers(),
                ]);

                const projects = projectsRes.data || [];
                const users    = usersRes.data    || [];

                let totalIssues    = 0;
                let statusCounts   = { todo: 0, inProgress: 0, inReview: 0, done: 0 };
                let priorityCounts = { high: 0, medium: 0, low: 0 };
                let velocityMap    = {};
                let allIssues      = [];

                const projectsWithIssues = await Promise.all(
                    projects.map(async (project) => {
                        const issuesRes = await fetchProjectIssues(project.id);
                        const issues    = issuesRes.data || [];
                        totalIssues    += issues.length;

                        issues.forEach(issue => {
                            const s = (issue.status || '').toUpperCase();
                            if      (s === 'DONE')        statusCounts.done++;
                            else if (s === 'IN PROGRESS') statusCounts.inProgress++;
                            else if (s === 'IN REVIEW')   statusCounts.inReview++;
                            else                          statusCounts.todo++;

                            const p = (issue.priority || '').toLowerCase();
                            if      (p === 'high' || p === 'highest') priorityCounts.high++;
                            else if (p === 'medium')                  priorityCounts.medium++;
                            else if (p === 'low'  || p === 'lowest')  priorityCounts.low++;
                        });

                        allIssues.push(
                            ...issues.map(i => ({
                                ...i,
                                projectName: project.pname,
                                projectKey:  project.pkey,
                            }))
                        );

                        try {
                            const sprintRes = await fetchSprints(project.id);
                            const sprints   = sprintRes.data || [];
                            sprints
                                .filter(s => s.status === 'COMPLETED')
                                .forEach(s => {
                                    const done = (s.issueIds || []).filter(id => {
                                        const iss = issues.find(i => String(i.id) === String(id));
                                        return iss?.status?.toUpperCase() === 'DONE';
                                    }).length;
                                    velocityMap[s.name] = (velocityMap[s.name] || 0) + done;
                                });
                        } catch (_) {
                            // sprint fetch failed for this project — skip
                        }

                        return { ...project, issueCount: issues.length };
                    })
                );

                allIssues.sort((a, b) => b.id - a.id);
                const recentIssues = allIssues.slice(0, 6);

                setStats({
                    totalProjects: projects.length,
                    totalIssues,
                    statusCounts,
                    priorityCounts,
                    projectsData: projectsWithIssues,
                    recentIssues,
                    users,
                    velocityData: {
                        labels: Object.keys(velocityMap),
                        datasets: [{
                            label: 'Issues Completed',
                            data: Object.values(velocityMap),
                            backgroundColor: 'rgba(76, 154, 255, 0.45)',
                            borderColor: '#4c9aff',
                            borderWidth: 1,
                            borderRadius: 4,
                        }],
                    },
                });
            } catch (err) {
                console.error('Dashboard load failed', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) return (
        <div className="dashboard-loading">
            <div className="db-spinner" />
            <p>Loading Dashboard…</p>
        </div>
    );

    if (error) return (
        <div className="dashboard-loading">
            <p className="db-error">{error}</p>
        </div>
    );

    const doughnutData = {
        labels: ['To Do', 'In Progress', 'In Review', 'Done'],
        datasets: [{
            data: [
                stats.statusCounts.todo,
                stats.statusCounts.inProgress,
                stats.statusCounts.inReview,
                stats.statusCounts.done,
            ],
            backgroundColor: ['#6b7a99', '#4c9aff', '#9b72ff', '#36b37e'],
            borderColor:     ['#1e2a4a', '#1e2a4a', '#1e2a4a', '#1e2a4a'],
            borderWidth: 2,
            hoverOffset: 6,
        }],
    };

    const barOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { usePointStyle: true },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#6b7a99' },
                grid:  { color: '#232f4f' },
            },
            x: {
                ticks: { color: '#6b7a99' },
                grid:  { color: '#232f4f' },
            },
        },
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#a0aec0', padding: 16, font: { size: 12 } },
            },
        },
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <MdDashboard />
                <h1>Project Insights</h1>
            </header>

            {/* ── Stat Cards ── */}
            <div className="metrics-grid">
                <StatCard title="Total Projects" value={stats.totalProjects}        icon={<MdRocketLaunch />} accent="blue"   />
                <StatCard title="Total Issues"   value={stats.totalIssues}          icon={<MdAssignment />}  accent="purple" />
                <StatCard title="Completed"      value={stats.statusCounts.done}    icon={<MdCheckCircle />} accent="green"  />
                <StatCard title="High Priority"  value={stats.priorityCounts.high}  icon={<MdWarning />}     accent="red"    />
            </div>

            {/* ── Charts ── */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Sprint Velocity</h3>
                    <div className="chart-body">
                        {stats.velocityData.labels.length > 0 ? (
                            <Bar data={stats.velocityData} options={barOptions} />
                        ) : (
                            <div className="chart-empty">No completed sprints found</div>
                        )}
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Work Distribution</h3>
                    <div className="doughnut-container">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* ── Projects + Recent Issues ── */}
            <div className="bottom-grid">
                <div className="projects-card">
                    <h3>Projects Overview</h3>
                    <div className="table-wrapper">
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Key</th>
                                    <th style={{ textAlign: 'right' }}>Issues</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.projectsData.length > 0
                                    ? stats.projectsData.map(project => (
                                        <tr key={project.id}>
                                            <td>{project.pname}</td>
                                            <td><span className="label-tag">{project.pkey}</span></td>
                                            <td style={{ textAlign: 'right' }}>{project.issueCount}</td>
                                        </tr>
                                    ))
                                    : <tr><td colSpan={3} className="table-empty">No projects found</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="projects-card">
                    <h3>Recent Issues</h3>
                    <div className="table-wrapper">
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Summary</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentIssues.length > 0
                                    ? stats.recentIssues.map(issue => (
                                        <tr key={issue.id}>
                                            <td><span className="label-tag">{issue.pkey}</span></td>
                                            <td className="issue-summary-cell">{issue.summary}</td>
                                            <td><StatusBadge status={issue.status} /></td>
                                            <td><PriorityBadge priority={issue.priority} /></td>
                                        </tr>
                                    ))
                                    : <tr><td colSpan={4} className="table-empty">No issues found</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Team Members ── */}
            {stats.users.length > 0 && (
                <div className="projects-card team-card">
                    <h3><MdPeople className="section-icon" />Team Members</h3>
                    <div className="team-grid">
                        {stats.users.map(u => (
                            <div key={u.id} className="team-member">
                                <div className="team-avatar">
                                    {u.avatarUrl
                                        ? <img src={u.avatarUrl} alt={u.displayName || u.username} />
                                        : <span>{((u.displayName || u.username || '?')[0]).toUpperCase()}</span>
                                    }
                                </div>
                                <div className="team-info">
                                    <p className="team-name">{u.displayName || u.username}</p>
                                    <p className="team-role">{u.role || 'member'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, accent }) => (
    <div className={`stat-card stat-card--${accent}`}>
        <div className="stat-info">
            <p>{title}</p>
            <h4>{value}</h4>
        </div>
        <div className={`stat-icon stat-icon--${accent}`}>{icon}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const key = (status || '').toUpperCase();
    const { label, cls } = STATUS_MAP[key] || { label: status || 'To Do', cls: 'todo' };
    return <span className={`status-badge ${cls}`}>{label}</span>;
};

const PriorityBadge = ({ priority }) => {
    const p     = (priority || 'medium').toLowerCase();
    const color = PRIORITY_COLORS[p] || PRIORITY_COLORS.medium;
    return (
        <span className="priority-badge" style={{ color, background: color + '22' }}>
            {priority || '—'}
        </span>
    );
};

export default Dashboard;
