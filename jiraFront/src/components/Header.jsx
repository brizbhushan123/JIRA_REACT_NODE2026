import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppMeta } from '../context/AppMetaContext';
import { useFilter } from '../context/FilterContext';
import { useCompanySettings } from '../context/CompanySettingsContext';
import {
    IoSearchOutline,
    IoNotificationsOutline,
    IoHelpCircleOutline,
    IoAddOutline,
    IoLogOutOutline,
    IoChevronDown,
    IoCheckmarkOutline,
    IoFolderOutline,
    IoGridOutline,
    IoListOutline,
    IoSettingsOutline,
    IoBug,
    IoPeopleOutline,
    IoClipboardSharp,
} from 'react-icons/io5';

const navItems = [
    { path: '/dashboard',    icon: <IoClipboardSharp />,    label: 'Dashboard' },
    { path: '/issues',  icon: <IoBug />,     label: 'Issues' },
    { path: '/board',    icon: <IoGridOutline />,    label: 'Board' },
    //{ path: '/backlog',  icon: <IoListOutline />,    label: 'Backlog' },
   // { path: '/team',     icon: <IoPeopleOutline />,  label: 'Team' },
    // { path: '/settings', icon: <IoSettingsOutline />, label: 'Settings' },
];

export default function Header({ user, onLogout }) {
    const { projects, currentProject, setCurrentProjectId } = useAppMeta();
    const { filters, setFilters } = useFilter();
    const { companyLogo } = useCompanySettings();
    const navigate = useNavigate();
    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const projectDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target))
                setProjectDropdownOpen(false);
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target))
                setProfileDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleProjectSelect = (projectId) => {
        setCurrentProjectId(projectId);
        setProjectDropdownOpen(false);
    };

    const projectName = currentProject?.pname || currentProject?.name || 'Select Project';
    const projectKey  = currentProject?.pkey  || '';
    const displayName = user?.displayName || user?.username || '?';

    return (
        <header className="header">
            <div className="header-left">
                {companyLogo && (
                    <img src={companyLogo} alt="Logo" className="header-logo" />
                )}

                <div className="project-switcher" ref={projectDropdownRef}>
                    <button
                        className="project-switcher-btn"
                        onClick={() => setProjectDropdownOpen((o) => !o)}
                        title="Switch project"
                    >
                        <span className="project-switcher-key">{projectKey}</span>
                        <span className="project-switcher-name">{projectName}</span>
                        <IoChevronDown className={`project-switcher-chevron ${projectDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {projectDropdownOpen && (
                        <div className="project-dropdown">
                            <div className="project-dropdown-header">Projects</div>
                            {projects.length === 0 && (
                                <div className="project-dropdown-empty">No projects found</div>
                            )}
                            {projects.map((p) => {
                                const isActive = String(p.id) === String(currentProject?.id);
                                return (
                                    <button
                                        key={p.id}
                                        className={`project-dropdown-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleProjectSelect(p.id)}
                                    >
                                        <span className="project-dropdown-icon"><IoFolderOutline /></span>
                                        <span className="project-dropdown-info">
                                            <span className="project-dropdown-name">{p.pname || p.name}</span>
                                            {p.pkey && <span className="project-dropdown-key">{p.pkey}</span>}
                                        </span>
                                        {isActive && <IoCheckmarkOutline className="project-dropdown-check" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <nav className="header-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `header-nav-item${isActive ? ' active' : ''}`}
                        >
                            <span className="header-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="header-right">
                <div className="header-search">
                    <IoSearchOutline className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search issues…"
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    />
                </div>
                <button className="create-btn" onClick={() => navigate('/create-issue')}>
                    <IoAddOutline /> Create
                </button>
                <button className="header-btn" title="Notifications">
                    <IoNotificationsOutline />
                </button>
                <button className="header-btn" title="Help">
                    <IoHelpCircleOutline />
                </button>

                <div className="profile-dropdown-wrapper" ref={profileDropdownRef}>
                    <button
                        className="profile-trigger"
                        onClick={() => setProfileDropdownOpen((o) => !o)}
                        title={displayName}
                    >
                        {user?.avatarUrl ? (
                            <img className="user-avatar" src={user.avatarUrl} alt={displayName} />
                        ) : (
                            <div className="user-avatar user-avatar-initials">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <IoChevronDown className={`profile-chevron${profileDropdownOpen ? ' open' : ''}`} />
                    </button>

                    {profileDropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-info">
                                {user?.avatarUrl ? (
                                    <img className="profile-dropdown-avatar" src={user.avatarUrl} alt={displayName} />
                                ) : (
                                    <div className="profile-dropdown-avatar profile-dropdown-avatar-initials">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="profile-dropdown-names">
                                    <span className="profile-dropdown-name">{displayName}</span>
                                    {user?.email && <span className="profile-dropdown-email">{user.email}</span>}
                                </div>
                            </div>
                            <NavLink
                                to="/settings"
                                className="profile-dropdown-item"
                                onClick={() => setProfileDropdownOpen(false)}
                            >
                                <IoSettingsOutline />
                                <span>Settings</span>
                            </NavLink>
                            {onLogout && (
                                <button
                                    className="profile-dropdown-item profile-dropdown-logout"
                                    onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                                >
                                    <IoLogOutOutline />
                                    <span>Sign out</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
