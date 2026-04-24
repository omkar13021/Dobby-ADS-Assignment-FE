import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
    accessToken = null;
};

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && 
            error.response?.data?.code === 'TOKEN_EXPIRED' && 
            !originalRequest._retry) {
            
            originalRequest._retry = true;

            if (!refreshPromise) {
                refreshPromise = apiClient.post('/api/auth/refresh')
                    .then((data) => {
                        setAccessToken(data.accessToken);
                        return data.accessToken;
                    })
                    .catch((err) => {
                        clearAccessToken();
                        window.dispatchEvent(new CustomEvent('auth:logout'));
                        throw err;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            try {
                const newToken = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        const message = error.response?.data?.error || error.message || 'Request failed';
        return Promise.reject(new Error(message));
    }
);

const api = {
    folder: {
        getTree: (userId) => apiClient.get('/api/folders', { params: { userId } }),
        getContents: (userId, parentId) => apiClient.get('/api/folders', { 
            params: { userId, parentId: parentId || '' } 
        }),
        create: (name, parentId, userId) => apiClient.post('/api/folders', { name, parentId, userId }),
        rename: (folderId, name) => apiClient.put(`/api/folders/${folderId}`, { name }),
        delete: (folderId) => apiClient.delete(`/api/folders/${folderId}`),
        getById: (folderId) => apiClient.get(`/api/folders/${folderId}`)
    },
    image: {
        upload: (file, folderId, userId) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folderId', folderId);
            formData.append('userId', userId);
            return apiClient.post('/api/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        getByFolder: (folderId) => apiClient.get(`/api/images/folder/${folderId}`),
        delete: (imageId) => apiClient.delete(`/api/images/${imageId}`)
    },
    auth: {
        register: (data) => apiClient.post('/api/auth/register', data),
        login: (data) => apiClient.post('/api/auth/login', data),
        refresh: () => apiClient.post('/api/auth/refresh'),
        logout: () => apiClient.post('/api/auth/logout'),
        getMe: () => apiClient.get('/api/auth/me')
    },
    user: {
        getAll: () => apiClient.get('/api/users'),
        getById: (userId) => apiClient.get(`/api/users/${userId}`)
    },
    client: apiClient
};

export default api;
