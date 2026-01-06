// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = document.querySelector('.btn-submit');

    // Check query params for success message (e.g. from signup)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        errorMessageDiv.style.color = '#4caf50'; // Green for success
        errorMessageDiv.style.background = 'rgba(76, 175, 80, 0.1)';
        errorMessageDiv.style.borderColor = 'rgba(76, 175, 80, 0.3)';
        errorMessageDiv.textContent = 'Account created successfully! Please login.';
        errorMessageDiv.style.display = 'block';
    }

    // Helper to show error
    const showError = (message) => {
        errorMessageDiv.style.color = '#ffeb3b'; // Reset to yellow/error
        errorMessageDiv.style.background = 'rgba(255, 0, 0, 0.1)';
        errorMessageDiv.style.borderColor = 'rgba(255, 0, 0, 0.3)';
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    };

    // Helper to hide error
    const hideError = () => {
        // Don't hide if it's the success message and user hasn't submitted yet? 
        // Actually, on submit we should clear it.
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            // Loading state
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            try {
                // Gather data
                const usernameOrEmail = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;

                // Call login API
                const response = await AuthAPI.login({
                    username: usernameOrEmail,
                    password: password
                });

                // Store token and user data
                if (response.data && response.data.accessToken) {
                    localStorage.setItem('accessToken', response.data.accessToken);
                    if (response.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    }
                }

                // Success
                // Redirect to home/dashboard
                window.location.href = 'home.html';

            } catch (error) {
                console.error('Login error:', error);
                const msg = getErrorMessage(error); // Using utility from api.js
                showError(msg);
            } finally {
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
