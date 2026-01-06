// routes/auth.js
// Handles authentication related API calls

const AuthAPI = {
    /**
     * Registers a new user.
     * @param {FormData} userData - The user data including file uploads if any.
     * @returns {Promise} Axios response data
     */
    register: async (userData) => {
        try {
            // "api" is the global instance from api.js
            const response = await api.post('/users/register', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            // Throw the error to be handled by the caller (UI)
            throw error;
        }
    },

    /**
     * Logs in a user.
     * @param {Object} credentials - { username: "...", password: "..." } (username can be email)
     * @returns {Promise} Axios response data
     */
    login: async (credentials) => {
        try {
            const response = await api.post('/users/login', credentials, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logs in or Registers via Google.
     * @param {string} idToken - The Google ID Token.
     * @returns {Promise} Axios response data
     */
    googleLogin: async (idToken) => {
        try {
            const response = await api.post('/users/google-login', { idToken }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Gets current user profile.
     * @returns {Promise} Axios response data
     */
    getCurrentUser: async () => {
        try {
            const response = await api.get('/users/current-user');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Refreshes the access token.
     * @returns {Promise} Axios response data containing new accessToken
     */
    refreshToken: async () => {
        try {
            // Use api instance but we might need to skip interceptor loop if this fails?
            // Actually, if this fails with 401, the interceptor will catch it.
            // We need to ensure the interceptor knows not to retry *this* request.
            // But here we just define the call.
            const response = await api.post('/users/refresh-token');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Updates user account details.
     * @param {FormData} userData - Form data containing fullName, email, avatar, coverImage.
     * @returns {Promise} Axios response data
     */
    updateAccount: async (userData) => {
        try {
            const response = await api.patch('/users/update-account', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logs out the user.
     * @returns {Promise} Axios response data
     */
    logout: async () => {
        try {
            const response = await api.post('/users/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// Global Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.dropdown-item.text-red');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                await AuthAPI.logout();
            } catch (error) {
                console.error("Logout API call failed:", error);
            }

            // Clear Client State
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('shift_edit_image');

            if (typeof showToast === 'function') {
                showToast("Logged out successfully", 'success');
            }

            // Redirect
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        });
    }
});
