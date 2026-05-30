import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { fetchProjectIssues, updateIssueStatus as apiUpdateStatus } from '../services/issueService';
import {
    fetchSprints,
    createSprintApi,
    updateSprintApi,
    startSprintApi,
    completeSprintApi,
    deleteSprintApi,
    addIssuesToSprintApi,
    removeIssueFromSprintApi,
} from '../services/sprintService';
import { useFilter } from './FilterContext';
import { useAppMeta } from './AppMetaContext';

const ProjectContext = createContext(null);

const mapIssue = (i) => ({
    ...i,
    key:      i.pkey,
    type:     i.type     || 'Task',
    status:   i.status   || 'TO DO',
    priority: i.priority || 'Medium',
    comments: [],
    labels:   [],
});

export function ProjectProvider({ children }) {
    const { currentProjectId } = useAppMeta();

    const [issues, setIssues]               = useState([]);
    const [sprints, setSprints]             = useState([]);
    const [loadingIssues, setLoadingIssues] = useState(false);

    /* ── sprints ── */
    const loadSprints = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const res = await fetchSprints(projectId);
            setSprints(res.data || []);
        } catch {
            setSprints([]);
        }
    }, []);

    const refreshSprints        = useCallback(() => loadSprints(currentProjectId), [currentProjectId, loadSprints]);
    const createSprint          = useCallback(async (payload) => { const res = await createSprintApi(currentProjectId, payload); await loadSprints(currentProjectId); return res.data; }, [currentProjectId, loadSprints]);
    const updateSprint          = useCallback(async (sprintId, payload) => { const res = await updateSprintApi(sprintId, payload); setSprints((p) => p.map((s) => String(s.id) === String(sprintId) ? res.data : s)); return res.data; }, []);
    const startSprint           = useCallback(async (sprintId) => { const res = await startSprintApi(sprintId); setSprints((p) => p.map((s) => String(s.id) === String(sprintId) ? res.data : s)); return res.data; }, []);
    const completeSprint        = useCallback(async (sprintId) => { const res = await completeSprintApi(sprintId); setSprints((p) => p.map((s) => String(s.id) === String(sprintId) ? res.data : s)); return res.data; }, []);
    const deleteSprint          = useCallback(async (sprintId) => { await deleteSprintApi(sprintId); setSprints((p) => p.filter((s) => String(s.id) !== String(sprintId))); }, []);
    const addIssuesToSprint     = useCallback(async (sprintId, issueIds) => { const res = await addIssuesToSprintApi(sprintId, issueIds); setSprints((p) => p.map((s) => String(s.id) === String(sprintId) ? { ...s, issueIds: res.data.issueIds } : s)); return res.data; }, []);
    const removeIssueFromSprint = useCallback(async (sprintId, issueId) => { await removeIssueFromSprintApi(sprintId, issueId); setSprints((p) => p.map((s) => String(s.id) === String(sprintId) ? { ...s, issueIds: (s.issueIds || []).filter((id) => String(id) !== String(issueId)) } : s)); }, []);

    /* ── issues ── */
    const loadIssues = useCallback(async (projectId) => {
        if (!projectId) return;
        setLoadingIssues(true);
        try {
            const res = await fetchProjectIssues(projectId);
            setIssues((res.data || []).map(mapIssue));
        } catch {
            setIssues([]);
        } finally {
            setLoadingIssues(false);
        }
    }, []);

    useEffect(() => {
        loadIssues(currentProjectId);
        loadSprints(currentProjectId);
    }, [currentProjectId, loadIssues, loadSprints]);

    const refreshIssues = useCallback(() => loadIssues(currentProjectId), [currentProjectId, loadIssues]);

    const getProjectIssues = useCallback(
        () => issues.filter((i) => String(i.projectId) === String(currentProjectId)),
        [issues, currentProjectId],
    );

    const updateIssueStatus = useCallback(async (issueId, newStatus) => {
        setIssues((prev) => prev.map((i) => String(i.id) === String(issueId) ? { ...i, status: newStatus } : i));
        try {
            await apiUpdateStatus(issueId, newStatus);
        } catch {
            loadIssues(currentProjectId);
        }
    }, [currentProjectId, loadIssues]);

    const updateIssue = useCallback((issueId, updates) => {
        setIssues((prev) => prev.map((i) => String(i.id) === String(issueId) ? { ...i, ...updates } : i));
    }, []);

    const addComment = useCallback((issueId, text, authorId) => {
        setIssues((prev) => prev.map((i) =>
            String(i.id) === String(issueId)
                ? { ...i, comments: [...(i.comments || []), { id: `c-${Date.now()}`, authorId, text, createdAt: new Date().toISOString() }] }
                : i
        ));
    }, []);

    const value = useMemo(() => ({
        issues,
        sprints,
        loadingIssues,
        getProjectIssues,
        updateIssueStatus,
        updateIssue,
        addComment,
        refreshIssues,
        refreshSprints,
        createSprint,
        updateSprint,
        startSprint,
        completeSprint,
        deleteSprint,
        addIssuesToSprint,
        removeIssueFromSprint,
    }), [
        issues, sprints, loadingIssues, getProjectIssues, updateIssueStatus, updateIssue,
        addComment, refreshIssues, refreshSprints, createSprint, updateSprint, startSprint,
        completeSprint, deleteSprint, addIssuesToSprint, removeIssueFromSprint,
    ]);

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error('useProject must be used inside ProjectProvider');
    return ctx;
}

/* ── useFilteredIssues ──────────────────────────────────────────────────────
   Reads from BOTH ProjectContext and FilterContext so re-renders are scoped:
   only re-runs when issues change OR filters change.
─────────────────────────────────────────────────────────────────────────── */
export function useFilteredIssues() {
    const { getProjectIssues } = useProject();
    const { filters } = useFilter();

    return useMemo(() => {
        let result = getProjectIssues();
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((i) => i.summary.toLowerCase().includes(q) || (i.key || i.pkey || '').toLowerCase().includes(q));
        }
        if (filters.types.length)       result = result.filter((i) => filters.types.includes(i.type));
        if (filters.priorities.length)  result = result.filter((i) => filters.priorities.includes(i.priority));
        if (filters.assigneeIds.length) result = result.filter((i) => filters.assigneeIds.includes(String(i.assigneeId)));
        return result;
    }, [getProjectIssues, filters]);
}
