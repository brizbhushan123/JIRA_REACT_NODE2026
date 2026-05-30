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

export const fetchProjects      = () => request('/candidate/projects');
export const fetchIssueById   = (id) => request(`/candidate/issues/${id}`);
export const fetchIssueTypes  = () => request('/candidate/issue-types');
export const fetchPriorities  = () => request('/candidate/priorities');
export const fetchUsers       = () => request('/candidate/users');

export const createIssue = (payload) =>
    request('/candidate/issues', { method: 'POST', body: JSON.stringify(payload) });

export const fetchProjectIssues = (projectId) =>
    request(`/candidate/projects/${projectId}/issues`);

export const updateIssueStatus = (issueId, status) =>
    request(`/candidate/issues/${issueId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });

export const fetchComments = (issueId) =>
    request(`/candidate/issues/${issueId}/comments`);

export const postComment = (issueId, body) =>
    request(`/candidate/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
    });

export const fetchSubtasks = (issueId) =>
    request(`/candidate/issues/${issueId}/subtasks`);

export const createSubtask = (parentId, payload) =>
    request(`/candidate/issues/${parentId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const linkSubtask = (childId, parentId) =>
    request(`/candidate/issues/${childId}/parent`, {
        method: 'PUT',
        body: JSON.stringify({ parentId }),
    });
