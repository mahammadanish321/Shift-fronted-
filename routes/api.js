// api.js - Global Axios Configuration
// Base URL: http://localhost:8000/api/v1
// Authentication: HttpOnly Cookies

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
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
// Utility function for error messages
function getErrorMessage(error) {
    if (error.response) {
        // If response is not JSON (likely HTML error page from server crash/proxy)
        const contentType = error.response.headers['content-type'];
        if (contentType && !contentType.includes('application/json')) {
            if (error.response.status === 404) return "Resource not found (404).";
            if (error.response.status === 500) return "Server error. Please try again later.";
            if (error.response.status === 502) return "Bad Gateway. Server might be restarting.";
            if (error.response.status === 503) return "Service unavailable.";
            return `Server Error (${error.response.status})`;
        }

        // Using backend provided message
        if (error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
    }

    // Network Error
    if (error.message === 'Network Error') {
        return "Unable to connect to server. Please check your internet connection.";
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
