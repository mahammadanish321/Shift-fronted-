// js/signup.js
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = document.querySelector('.btn-submit');

    // Helper to show error
    const showError = (message) => {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    };

    // Helper to hide error
    const hideError = () => {
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
    };

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            // Loading state
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;

            try {
                // Gather data
                const fullName = document.getElementById('fullName').value.trim();
                const email = document.getElementById('email').value.trim();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;

                // Create FormData as per backend requirement
                const formData = new FormData();

                // Validate Email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showError("Please enter a valid email address.");
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }

                formData.append('fullName', fullName);
                formData.append('email', email);
                formData.append('username', username);
                formData.append('password', password);

                // Call register API
                await AuthAPI.register(formData);

                // Success
                // Redirect to login or home
                window.location.href = 'login.html?registered=true';

            } catch (error) {
                console.error('Registration error:', error);
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

                showToast("Account created with Google successfully!", 'success');
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
            btnContainer.innerHTML = '';
            btnContainer.style.padding = '0';
            btnContainer.style.border = 'none';
            btnContainer.style.background = 'transparent';

            google.accounts.id.initialize({
                client_id: "426765358744-sc34cuq0dnoakmjcel4bdagjjstudmc3.apps.googleusercontent.com", // REPLACE THIS WITH ACTUAL CLIENT ID
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
            setTimeout(initGoogleBtn, 500);
        }
    };

    initGoogleBtn();
});
