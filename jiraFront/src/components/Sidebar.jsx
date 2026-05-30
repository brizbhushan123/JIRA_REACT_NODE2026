import { NavLink, useLocation } from 'react-router-dom';
import { useAppMeta } from '../context/AppMetaContext';
import { useCompanySettings } from '../context/CompanySettingsContext';
import {
    IoGridOutline,
    IoListOutline,
    IoSettingsOutline,
    IoMapOutline,
    IoChevronBack,
    IoChevronForward,
    IoPeopleOutline,
} from 'react-icons/io5';
import { useState } from 'react';

export default function Sidebar() {
    const { projects, currentProjectId, setCurrentProjectId, currentProject } =
        useAppMeta();
    const { companyLogo } = useCompanySettings();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const navItems = [
        { path: '/board', icon: <IoGridOutline />, label: 'Board' },
        { path: '/backlog', icon: <IoListOutline />, label: 'Backlog' },
        { path: '/roadmap', icon: <IoMapOutline />, label: 'Roadmap' },
        { path: '/team', icon: <IoPeopleOutline />, label: 'Team' },
        { path: '/settings', icon: <IoSettingsOutline />, label: 'Settings' },
    ];

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <button
                className="sidebar-collapse-btn"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? <IoChevronForward /> : <IoChevronBack />}
            </button>

            <div className="sidebar-header">
                {collapsed ? (
                    <img
                        src={companyLogo}
                        alt="Axira"
                        className="sidebar-logo-icon"
                        title="Axira"
                    />
                ) : (
                    <div className="sidebar-logo-block">
                        <img
                            src={companyLogo}
                            alt="Axira"
                            className="sidebar-logo-full"
                        />
                        <div className="sidebar-logo-meta">
                            {/* <div className="sidebar-title">
                                {currentProject?.pname || 'Project'}
                            </div>
                            <div className="sidebar-subtitle">Software project</div> */}
                        </div>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {!collapsed && (
                    <div className="sidebar-section-title">Planning</div>
                )}
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* {!collapsed && (
                <div className="sidebar-project-select">
                    <select
                        className="project-selector"
                        value={currentProjectId}
                        onChange={(e) => setCurrentProjectId(e.target.value)}
                    >
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.avatarUrl} {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            )} */}
        </aside>
    );
}
