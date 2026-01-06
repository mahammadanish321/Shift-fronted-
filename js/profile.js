document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // Inputs
    const editNameIn = document.getElementById('editName');
    const editHandleIn = document.getElementById('editHandle');
    const avatarInput = document.getElementById('avatarInput');
    const coverInput = document.getElementById('coverInput');

    // Display Elements (Main Page)
    const profileName = document.getElementById('profileName');
    const profileHandle = document.getElementById('profileHandle');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileCover = document.getElementById('profileCover');
    const navAvatar = document.getElementById('navAvatar');
    const navUsername = document.getElementById('navUsername');

    // Preview Elements (Modal)
    const editAvatarPreview = document.getElementById('editAvatarPreview');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const editCoverPreview = document.getElementById('editCoverPreview');

    // --- State ---
    let newAvatarFile = null;
    let newCoverFile = null;

    // --- Functions ---
    function openModal() {
        // Pre-fill data
        editNameIn.value = profileName.innerText;
        editHandleIn.value = profileHandle.innerText.replace('@', '');

        // Pre-fill images
        if (profileAvatar) {
            editAvatarPreview.src = profileAvatar.src;
        }
        if (profileCover) {
            // Check if it's a valid URL or just a placeholder
            if (profileCover.src) {
                editCoverPreview.style.backgroundImage = `url('${profileCover.src}')`;
                editCoverPreview.innerHTML = ''; // Remove text if image exists
            } else {
                editCoverPreview.style.backgroundImage = 'none';
                editCoverPreview.innerHTML = '<span class="cover-upload-text"><i class="fas fa-image"></i> Click to change cover</span>';
            }
        }

        // Add class for CSS transition
        editProfileModal.classList.add('active');
    }

    function closeModal() {
        editProfileModal.classList.remove('active');
        // Reset state
        newAvatarFile = null;
        newCoverFile = null;
    }

    function updateImagePreview(file, previewElement, isBg = false) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (isBg) {
                previewElement.style.backgroundImage = `url('${e.target.result}')`;
                previewElement.innerHTML = '';
            } else {
                previewElement.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    // --- Event Listeners ---

    // Modal Control
    if (editProfileBtn) editProfileBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeModal);

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            closeModal();
        }
    });

    // File Input Triggers
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => avatarInput.click());
    }
    if (editCoverPreview) {
        editCoverPreview.addEventListener('click', () => coverInput.click());
    }

    // File Input Changes
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                newAvatarFile = e.target.files[0];
                updateImagePreview(newAvatarFile, editAvatarPreview, false);
            }
        });
    }

    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                newCoverFile = e.target.files[0];
                updateImagePreview(newCoverFile, editCoverPreview, true);
            }
        });
    }

    // Save Changes
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const newName = editNameIn.value.trim();
            const newHandle = editHandleIn.value.trim();

            if (!newName || !newHandle) {
                alert("Name and handle are required.");
                return;
            }

            // --- Update UI (Optimistic) ---
            profileName.innerText = newName;
            profileHandle.innerText = '@' + newHandle;
            navUsername.innerText = newName;

            if (newAvatarFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileAvatar.src = e.target.result;
                    // Update nav avatar too (it's a div with bg image? check html)
                    // HTML: <div class="avatar" id="navAvatar"></div>
                    // So we probably set background-image
                    navAvatar.style.backgroundImage = `url('${e.target.result}')`;
                    navAvatar.style.backgroundSize = 'cover';
                };
                reader.readAsDataURL(newAvatarFile);
            }

            if (newCoverFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileCover.src = e.target.result;
                };
                reader.readAsDataURL(newCoverFile);
            }

            // Close modal
            closeModal();

            // TODO: Here you would send FormData to backend
            /*
            const formData = new FormData();
            formData.append('name', newName);
            formData.append('handle', newHandle);
            if (newAvatarFile) formData.append('avatar', newAvatarFile);
            if (newCoverFile) formData.append('cover', newCoverFile);
            
            await axios.post('/api/user/profile', formData);
            */

            alert("Profile updated successfully!");

        });
    }

    // --- Initial Logic ---
    // Make sure nav avatar matches profile avatar on load if generic
    // (This is just fallback logic, ideally backend data does this)
});
