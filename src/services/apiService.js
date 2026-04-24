import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'Request failed';
        return Promise.reject(new Error(message));
    }
);

const api = {
    folder: {
        getTree: (userId) => apiClient.get('/api/folders', { params: { userId } }),
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
        logout: () => apiClient.post('/api/auth/logout')
    },
    user: {
        getAll: () => apiClient.get('/api/users'),
        getById: (userId) => apiClient.get(`/api/users/${userId}`)
    },
    client: apiClient
};

export default api;
