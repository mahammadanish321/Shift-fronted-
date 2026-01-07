// api.js - Global Axios Configuration
// Base URL: http://localhost:8000/api/v1
// Authentication: HttpOnly Cookies

const api = axios.create({
    baseURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000/api/v1'
        : '/api/v1',
    withCredentials: true // Required for HttpOnly Cookies
});

// Request Interceptor to attach Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Response Interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {

            // If the error comes from the login or refresh page/request itself, don't loop
            if (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token')) {
                // Clear token and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('login.html') &&
                    !window.location.pathname.includes('signup.html')) {
                    window.location.href = 'login.html';
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the refresh endpoint
                // We use a direct call or AuthAPI (assuming AuthAPI is loaded or we make a direct axios call)
                // Since this file (api.js) doesn't import AuthAPI (circular dep risk if AuthAPI imports api.js),
                // we should make the call using the 'api' instance but we need to be careful.
                // Or better, just make a raw axios call if needed, but 'api' instance handles baseUrl and creds.
                // We'll use 'api' instance but rely on the check above (url.includes) to avoid loop.

                const response = await api.post('/users/refresh-token');

                const { accessToken } = response.data;

                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;

                    processQueue(null, accessToken);

                    // Retry originally failed request
                    originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
                    return api(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                // Refresh failed - logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('login.html') &&
                    !window.location.pathname.includes('signup.html')) {
                    window.location.href = 'login.html';
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Utility function for error messages
function getErrorMessage(error) {
    if (error.response) {
        // Context-aware Handling
        const url = error.config ? error.config.url : '';
        const status = error.response.status;

        // Login Specific Errors
        if (url.includes('/auth/login') || url.includes('/login')) {
            if (status === 404) return "Account not found. Please sign up.";
            if (status === 401) return "Incorrect username or password.";
        }

        // Backend provided message (if JSON)
        if (error.response.data && error.response.data.message) {
            return error.response.data.message;
        }

        // Fallback for HTML/Non-JSON responses or missing messages
        if (status === 404) return "The requested resource was not found.";
        if (status === 500) return "Something went wrong on our end. Please try again.";
        if (status === 502) return "Server is warming up. Please try again.";
        if (status === 503) return "Service unavailable at the moment.";
        if (status === 401) return "Session expired. Please login again.";
        if (status === 403) return "You don't have permission to perform this action.";
        if (status === 413) return "File is too large to upload.";

        return "An issue occurred. Please try again.";
    }

    // Network Error
    if (error.message === 'Network Error') {
        return "Unable to connect. Please check your internet connection.";
    }

    return error.message || 'An unexpected error occurred.';
}

// --- GLOBAL NOTIFICATION SYSTEM ---
window.showToast = function (message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    let icon = '<i class="fas fa-info-circle" style="color:var(--accent-blue)"></i>';
    if (type === 'success') icon = '<i class="fas fa-check-circle" style="color:#4caf50"></i>';
    if (type === 'error') icon = '<i class="fas fa-exclamation-circle" style="color:var(--accent-red)"></i>';

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};
