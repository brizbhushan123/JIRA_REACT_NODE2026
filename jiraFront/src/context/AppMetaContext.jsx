import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchProjects, fetchUsers } from '../services/issueService';

const AppMetaContext = createContext(null);

export function AppMetaProvider({ children }) {
    const [projects, setProjects]                 = useState([]);
    const [users, setUsers]                       = useState([]);
    const [currentProjectId, setCurrentProjectId] = useState(null);

    useEffect(() => {
        Promise.all([fetchProjects(), fetchUsers()])
            .then(([projRes, userRes]) => {
                const list = projRes.data || [];
                setProjects(list);
                setUsers(userRes.data || []);
                if (list.length > 0) setCurrentProjectId(list[0].id);
            })
            .catch(() => {});
    }, []);

    const refreshProjects = useCallback(async () => {
        const res = await fetchProjects();
        const list = res.data || [];
        setProjects(list);
        return list;
    }, []);

    const refreshUsers = useCallback(async () => {
        const res = await fetchUsers();
        setUsers(res.data || []);
        return res.data || [];
    }, []);

    const updateUser = useCallback((userId, updates) => {
        setUsers((prev) => prev.map((u) => String(u.id) === String(userId) ? { ...u, ...updates } : u));
    }, []);

    const getUser = useCallback(
        (id) => users.find((u) => String(u.id) === String(id)) || null,
        [users],
    );

    const currentProject = useMemo(
        () => projects.find((p) => p.id === currentProjectId) || null,
        [projects, currentProjectId],
    );

    const value = useMemo(() => ({
        projects,
        users,
        currentProject,
        currentProjectId,
        setCurrentProjectId,
        getUser,
        updateUser,
        refreshProjects,
        refreshUsers,
    }), [projects, users, currentProject, currentProjectId, getUser, updateUser, refreshProjects, refreshUsers]);

    return <AppMetaContext.Provider value={value}>{children}</AppMetaContext.Provider>;
}

export function useAppMeta() {
    const ctx = useContext(AppMetaContext);
    if (!ctx) throw new Error('useAppMeta must be used inside AppMetaProvider');
    return ctx;
}
