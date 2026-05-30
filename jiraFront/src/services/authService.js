async function request(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
        throw new Error(data?.message || 'Request failed');
    }

    return data;
}

export async function loginUser(credentials) {
    return request('/candidate/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function logoutUser() {
    return request('/candidate/logout', { method: 'POST' });
}
