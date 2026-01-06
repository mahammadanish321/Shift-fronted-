// api.js - Global Axios Configuration
// Base URL: http://localhost:8000/api/v1
// Authentication: HttpOnly Cookies

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true // Required for HttpOnly Cookies
});

// Response Interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Redirect to login if unauthorized (except on auth pages)
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('signup.html')) {
                window.location.href = 'login.html';
            }
        }
        return Promise.reject(error);
    }
);

// Utility function for error messages
function getErrorMessage(error) {
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    return error.message || 'An unexpected error occurred.';
}
