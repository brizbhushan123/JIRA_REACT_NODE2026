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

export async function registerUser(credentials) {
    return request('/candidate/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function loginAdmin(credentials) {
    return request('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function logoutAdmin() {
    return request('/admin/logout', { method: 'POST' });
}
