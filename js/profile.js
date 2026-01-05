document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const defaultProfile = {
        name: 'Anish',
        handle: '@anish_dev',
        credits: 150,
        plan: 'Pro — 3D',
        email: 'anish@shift.studio'
    };

    // Load from LocalStorage or use Default
    let userProfile = JSON.parse(localStorage.getItem('shift_user_profile')) || defaultProfile;

    // --- DOM Elements ---
    const domElements = {
        name: document.getElementById('profileName'),
        handle: document.getElementById('profileHandle'),
        credits: document.getElementById('profileCredits'),
        plan: document.getElementById('profilePlan'),
        email: document.getElementById('profileEmail'),
        navName: document.getElementById('navUsername'),

        // Modal
        modal: document.getElementById('editProfileModal'),
        editBtn: document.getElementById('editProfileBtn'),
        closeBtn: document.getElementById('closeModalBtn'),
        cancelBtn: document.getElementById('cancelEditBtn'),
        saveBtn: document.getElementById('saveProfileBtn'),

        // Inputs
        inputName: document.getElementById('editName'),
        inputHandle: document.getElementById('editHandle')
    };

    // --- Functions ---

    function updateUI() {
        if (domElements.name) domElements.name.textContent = userProfile.name;
        if (domElements.handle) domElements.handle.textContent = userProfile.handle;
        if (domElements.credits) domElements.credits.textContent = userProfile.credits;
        if (domElements.plan) domElements.plan.textContent = userProfile.plan;
        if (domElements.email) domElements.email.textContent = userProfile.email;
        if (domElements.navName) domElements.navName.textContent = userProfile.name;
    }

    function openModal() {
        // Populate inputs
        domElements.inputName.value = userProfile.name;
        domElements.inputHandle.value = userProfile.handle.replace('@', ''); // Remove @ for editing if present

        domElements.modal.classList.add('active');
    }

    function closeModal() {
        domElements.modal.classList.remove('active');
    }

    function saveProfile() {
        const newName = domElements.inputName.value.trim();
        const newHandle = domElements.inputHandle.value.trim();

        if (newName) userProfile.name = newName;
        if (newHandle) {
            // Ensure @ prefix
            userProfile.handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
        }

        // Save to storage
        localStorage.setItem('shift_user_profile', JSON.stringify(userProfile));

        // Update UI
        updateUI();
        closeModal();
    }

    // --- Event Listeners ---
    if (domElements.editBtn) {
        domElements.editBtn.addEventListener('click', openModal);
    }

    if (domElements.closeBtn) {
        domElements.closeBtn.addEventListener('click', closeModal);
    }

    if (domElements.cancelBtn) {
        domElements.cancelBtn.addEventListener('click', closeModal);
    }

    if (domElements.saveBtn) {
        domElements.saveBtn.addEventListener('click', saveProfile);
    }

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === domElements.modal) {
            closeModal();
        }
    });

    // Initialize
    updateUI();
});
