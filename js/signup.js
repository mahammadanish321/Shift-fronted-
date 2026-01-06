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
});
