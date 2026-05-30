import { Outlet, useNavigate } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import { useAdminAuth } from '../App';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
    const { adminLogout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login', { replace: true });
    };

    return (
        <div className="admin-shell">
            <AdminSidebar
                onUserApp={() => navigate('/board')}
            />
            <div className="admin-main">
                <header className="admin-main-header">
                    <div />
                    <button type="button" className="logout-btn" onClick={handleLogout}>
                        <IoLogOutOutline /> Logout
                    </button>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
