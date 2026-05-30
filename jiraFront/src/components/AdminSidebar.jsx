import { NavLink } from 'react-router-dom';
import {
    IoGridOutline,
    IoPeopleOutline,
    IoPersonAddOutline,
    IoCodeSlashOutline,
    IoSettingsOutline,
    IoSwapHorizontalOutline,
    IoRocketOutline,
    IoFolderOpenOutline,
} from 'react-icons/io5';
import { useCompanySettings } from '../context/CompanySettingsContext';

export default function AdminSidebar({ onUserApp }) {
    const { companyLogo } = useCompanySettings();
    const navItems = [
        { path: '/admin', icon: <IoGridOutline />, label: 'Overview' },
        { path: '/admin/projects', icon: <IoFolderOpenOutline />, label: 'Projects' },
        { path: '/admin/create-user',      icon: <IoPersonAddOutline />, label: 'Create User' },
        { path: '/admin/create-developer', icon: <IoCodeSlashOutline />, label: 'Create Developer' },
        { path: '/admin/user-list', icon: <IoPeopleOutline />, label: 'User List' },
        { path: '/admin/sprints', icon: <IoRocketOutline />, label: 'Sprints' },
        { path: '/admin/settings', icon: <IoSettingsOutline />, label: 'Settings' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <img className="admin-sidebar-logo-img" src={companyLogo} alt="Company logo" />
                <div>
                    <strong>Admin</strong>
                    <span>Control panel</span>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) =>
                            `admin-sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar-actions">
                <button type="button" className="admin-sidebar-link" onClick={onUserApp}>
                    <IoSwapHorizontalOutline />
                    <span>User App</span>
                </button>
            </div>
        </aside>
    );
}
