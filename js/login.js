// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = document.querySelector('.btn-submit');

    // Check query params for success message (e.g. from signup)
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('registered') === 'true') {
        // Clear param to avoid showing toast on reload? Optional, but good UX.
        // For now, just show toast.
        // Wait a small delay to ensure toast container is ready if script runs fast? 
        // DOMContentLoaded handles it.
        setTimeout(() => {
            showToast("Account created successfully! Please login.", 'success');
        }, 300);
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

    // --- GOOGLE SIGN IN ---
    // Handle the response from Google
    window.handleGoogleLogin = async (response) => {
        try {
            const idToken = response.credential;
            const res = await AuthAPI.googleLogin(idToken);

            if (res.data && res.data.accessToken) {
                localStorage.setItem('accessToken', res.data.accessToken);
                if (res.data.user) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                }

                showToast("Logged in with Google successfully!", 'success');
                window.location.href = 'home.html';
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            showToast(getErrorMessage(error), 'error');
        }
    };

    // Initialize Google Button
    const initGoogleBtn = () => {
        if (typeof google !== 'undefined' && document.querySelector('.btn-google')) {
            const btnContainer = document.querySelector('.btn-google');
            // Clear existing content (custom icon/text)
            btnContainer.innerHTML = '';
            // Remove padding/border from our custom class to let Google button fill it nicely
            btnContainer.style.padding = '0';
            btnContainer.style.border = 'none';
            btnContainer.style.background = 'transparent';

            google.accounts.id.initialize({
                client_id: "426765358744-sc34cuq0dnoakmjcel4bdagjjstudmc3.apps.googleusercontent.com",
                callback: window.handleGoogleLogin
            });
            google.accounts.id.renderButton(
                btnContainer,
                {
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    width: btnContainer.offsetWidth
                }
            );
        } else {
            // Retry if script not loaded yet
            setTimeout(initGoogleBtn, 500);
        }
    };

    initGoogleBtn();
});
