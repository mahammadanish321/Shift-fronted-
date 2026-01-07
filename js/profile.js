document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // Inputs
    // Inputs
    const editNameIn = document.getElementById('editName');
    const avatarInput = document.getElementById('avatarInput');
    const coverInput = document.getElementById('coverInput');

    // Display Elements (Main Page)
    const profileName = document.getElementById('profileName');
    const profileHandle = document.getElementById('profileHandle');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileCover = document.getElementById('profileCover');
    const navAvatar = document.getElementById('navAvatar');
    const navUsername = document.getElementById('navUsername');
    const profileCredits = document.getElementById('profileCredits');
    const profilePlan = document.getElementById('profilePlan');
    const profileEmail = document.getElementById('profileEmail');
    const headerCredits = document.getElementById('headerCredits');

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
        // Handle no longer editable

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
                const file = e.target.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    showToast("Avatar image size exceeds 5MB limit.", 'error');
                    e.target.value = ''; // Clear input
                    return;
                }
                newAvatarFile = file;
                updateImagePreview(newAvatarFile, editAvatarPreview, false);
            }
        });
    }

    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    showToast("Cover image size exceeds 5MB limit.", 'error');
                    e.target.value = ''; // Clear input
                    return;
                }
                newCoverFile = file;
                updateImagePreview(newCoverFile, editCoverPreview, true);
            }
        });
    }

    // --- Initial Logic ---
    loadUserProfile();


    // Save Changes
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const newName = editNameIn.value.trim();

            // Note: Email update is not in the modal currently, assuming just name/images for now per modal HTML

            const originalBtnText = saveProfileBtn.innerText;
            saveProfileBtn.innerText = "Saving...";
            saveProfileBtn.disabled = true;

            try {
                const formData = new FormData();
                if (newName) formData.append('fullName', newName); // Backend expects fullName

                // If user changed email, append it (but modal doesn't have email input yet, skipping)

                if (newAvatarFile) formData.append('avatar', newAvatarFile);
                if (newCoverFile) formData.append('coverImage', newCoverFile);


                const response = await AuthAPI.updateAccount(formData);
                const updatedUser = response.data.user || response.data || response;

                // Update UI with new data
                if (profileName) profileName.innerText = updatedUser.fullName || newName;
                if (profileHandle) profileHandle.innerText = '@' + (updatedUser.username || "username");
                if (navUsername) navUsername.innerText = updatedUser.username || updatedUser.fullName || newName;

                if (updatedUser.avatarUrl) {
                    if (profileAvatar) profileAvatar.src = updatedUser.avatarUrl;
                    if (navAvatar) {
                        navAvatar.style.backgroundImage = `url('${updatedUser.avatarUrl}')`;
                        navAvatar.style.backgroundSize = 'cover';
                    }
                }

                if (updatedUser.coverUrl && profileCover) {
                    profileCover.src = updatedUser.coverUrl;
                }

                showToast("Profile updated successfully!", 'success');

                // Close modal
                closeModal();

                // Reload page after short delay to reflect changes everywhere (header, cached data, etc.)
                // This ensures a "clean" state
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (error) {
                console.error("Update failed:", error);
                showToast(getErrorMessage(error), 'error');
            } finally {
                saveProfileBtn.innerText = originalBtnText;
                saveProfileBtn.disabled = false;
            }
        });
    }



    // --- Initial Logic ---
    loadUserProfile();

    async function loadUserProfile() {
        const elementsToCheck = [profileName, profileHandle, profileCredits, profilePlan, profileEmail];
        // Add skeleton class to indicate loading
        elementsToCheck.forEach(el => {
            if (el) {
                el.classList.add('skeleton');
                el.innerText = 'Loading'; // Placeholder text keeps layout stable
            }
        });

        try {
            const userData = await AuthAPI.getCurrentUser();
            const user = userData.data.user || userData.data || userData; // Adjust based on API response

            // Remove skeleton before updating text
            elementsToCheck.forEach(el => el && el.classList.remove('skeleton'));

            // Update Text
            if (profileName) profileName.innerText = user.fullName || "User";
            if (profileHandle) profileHandle.innerText = '@' + (user.username || "username");
            if (navUsername) navUsername.innerText = user.username || user.fullName || "User";

            if (profileCredits) profileCredits.innerText = `${user.credits || 0} / ${user.subscription ? user.subscription.limit : 5}`;
            if (profileEmail) profileEmail.innerText = user.email || "-";
            if (headerCredits) {
                const limit = user.subscription && user.subscription.limit ? user.subscription.limit : 5;
                headerCredits.innerText = `${user.credits || 0} / ${limit}`;
            }

            // Display Plan
            if (profilePlan) {
                // Assuming user.subscription.planId exists or check user.isPro etc.
                // If detailed plan object is returned: user.subscription.planName
                // Else fallback to "Free"
                const planName = (user.subscription && user.subscription.planId) ? user.subscription.planId : "Free";
                // Capitalize first letter if it's strictly lower case "free" or "pro"
                profilePlan.innerText = planName.charAt(0).toUpperCase() + planName.slice(1);
            }

            // Update Images
            const avatarUrl = user.avatar || user.avatarUrl;
            if (avatarUrl) {
                if (profileAvatar) {
                    profileAvatar.src = avatarUrl;
                    // Remove onerror to prevent reverting to default if we want to validly show nothing or broken link
                    // But usually onerror is good fallback. User said "remove default image", 
                    // maybe they mean don't show the placeholder if there IS a user image?
                    // Or remove the hardcoded default in HTML?
                    // Let's assume they want the JS to authoritative set it.
                    // If no avatarUrl, we leave it blank or let HTML onerror handle it?
                    // I will remove the onerror attribute from the element via JS to be safe?
                    // No, simpler: just set src.
                }
                if (navAvatar) {
                    navAvatar.style.backgroundImage = `url('${avatarUrl}')`;
                    navAvatar.style.backgroundSize = 'cover';
                }
            } else {
                // If no avatar, explicitly set to empty or a specific 'no-avatar' state if desired?
                // or just do nothing and let HTML default stay?
                // request: "remove the defult image"
                // If they mean the hardcoded html one:
                // "and if user in a free plan that its should also show in the plan section"
            }

            const coverUrl = user.coverImage || user.coverUrl;
            if (coverUrl && profileCover) {
                profileCover.src = coverUrl;
            }

        } catch (error) {
            console.error("Failed to load profile:", error);
            const elementsToCheck = [profileName, profileHandle, profileCredits, profilePlan, profileEmail];
            elementsToCheck.forEach(el => el && el.classList.remove('skeleton'));
            // If 401, interceptor handles it
        }
    }

    // Save Changes

});
