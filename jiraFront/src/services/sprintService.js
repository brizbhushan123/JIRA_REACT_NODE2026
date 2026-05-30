async function request(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
        throw new Error(data?.message || 'Request failed');
    }
    return data;
}

export const fetchSprints = (projectId) =>
    request(`/candidate/projects/${projectId}/sprints`);

export const createSprintApi = (projectId, payload) =>
    request(`/candidate/projects/${projectId}/sprints`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const updateSprintApi = (sprintId, payload) =>
    request(`/candidate/sprints/${sprintId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

export const startSprintApi = (sprintId) =>
    request(`/candidate/sprints/${sprintId}/start`, { method: 'PATCH' });

export const completeSprintApi = (sprintId) =>
    request(`/candidate/sprints/${sprintId}/complete`, { method: 'PATCH' });

export const deleteSprintApi = (sprintId) =>
    request(`/candidate/sprints/${sprintId}`, { method: 'DELETE' });

export const addIssuesToSprintApi = (sprintId, issueIds) =>
    request(`/candidate/sprints/${sprintId}/issues`, {
        method: 'POST',
        body: JSON.stringify({ issueIds }),
    });

export const removeIssueFromSprintApi = (sprintId, issueId) =>
    request(`/candidate/sprints/${sprintId}/issues/${issueId}`, { method: 'DELETE' });
