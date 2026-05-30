import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Login from './pages/Login';
import { logoutUser } from './services/authService';
import { ProjectProvider } from './context/ProjectContext';
import { FilterProvider } from './context/FilterContext';
import { AppMetaProvider } from './context/AppMetaContext';
import { CompanySettingsProvider } from './context/CompanySettingsContext';
import Header from './components/Header';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import CreateIssue from './pages/CreateIssue';
import IssueDetail from './pages/IssueDetail';
import Issues from './pages/Issues';
import Settings from './pages/Settings';

import Admin from './pages/admin/Admin';
import AdminCreateUser from './pages/admin/AdminCreateUser';
import AdminCreateDeveloper from './pages/admin/AdminCreateDeveloper';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUserList from './pages/admin/AdminUserList';
import AdminSprints from './pages/admin/AdminSprints';
import AdminCreateProject from './pages/admin/AdminCreateProject';
import AdminLogin from './pages/admin/AdminLogin';
import { logoutAdmin } from './services/admin/authService';


// Auth context
const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

const AdminAuthContext = createContext(null);
export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

// Protected route wrapper — redirects to /login if not authenticated
function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AdminProtectedRoute() {
  const { admin } = useAdminAuth();
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

// App layout with sidebar + header (only for authenticated routes)
function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <div className="main-area">
        <Header user={user} onLogout={logout} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('jira_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('jira_admin');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('jira_user', JSON.stringify(userData));
  };

  const logout = () => {
    logoutUser().catch(() => {});
    setUser(null);
    localStorage.removeItem('jira_user');
  };

  const adminLogin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('jira_admin', JSON.stringify(adminData));
  };

  const adminLogout = () => {
    logoutAdmin().catch(() => {});
    setAdmin(null);
    localStorage.removeItem('jira_admin');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout }}>
        <CompanySettingsProvider>
        <AppMetaProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
              path="/admin/login"
              element={admin ? <Navigate to="/admin" replace /> : <AdminLogin />}
            />

            {/* Admin routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<FilterProvider><ProjectProvider><Outlet /></ProjectProvider></FilterProvider>}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/user-list" element={<AdminUserList />} />
                  <Route path="/admin/create-user" element={<AdminCreateUser />} />
                  <Route path="/admin/create-developer" element={<AdminCreateDeveloper />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/sprints" element={<AdminSprints />} />
                  <Route path="/admin/projects" element={<AdminCreateProject />} />
                </Route>
              </Route>
            </Route>

            {/* User routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<FilterProvider><ProjectProvider><Outlet /></ProjectProvider></FilterProvider>}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="/issues" element={<Issues />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/create-issue" element={<CreateIssue />} />
                  <Route path="/issues/:id" element={<IssueDetail />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </BrowserRouter>
        </AppMetaProvider>
        </CompanySettingsProvider>
      </AdminAuthContext.Provider>
    </AuthContext.Provider>
  );
}
