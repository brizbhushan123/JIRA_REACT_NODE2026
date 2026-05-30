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

export const fetchAdminProjects = (search = '') =>
    request(`/admin/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const createProjectApi = (payload) =>
    request('/admin/projects', { method: 'POST', body: JSON.stringify(payload) });

export const updateProjectApi = (projectId, payload) =>
    request(`/admin/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteProjectApi = (projectId) =>
    request(`/admin/projects/${projectId}`, { method: 'DELETE' });
