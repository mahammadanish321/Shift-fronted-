/* --- home.js --- */

// =========================================
// 1. GLOBAL VARIABLES & ELEMENTS
// =========================================
let state = { x: 0, y: 0, rot: 0, pitch: 0, yaw: 0 };

// Controller Elements
const joyWrapper = document.querySelector('.dial-wrapper');
const dialRing = document.querySelector('.dial-ring');
const dot = document.querySelector('.control-dot');
const pitchIn = document.getElementById('pitchIn');
const yawIn = document.getElementById('yawIn');

// Readout Elements
const outX = document.querySelector('.readout span:nth-child(1) b');
const outY = document.querySelector('.readout span:nth-child(2) b');
const outRoll = document.querySelector('.readout span:nth-child(3) b');
const outPitch = document.querySelector('.readout span:nth-child(4) b');
const outYaw = document.querySelector('.readout span:nth-child(5) b');

// Image & Workflow Elements
const sourceImg = document.getElementById('sourceImg');
const resultImg = document.getElementById('resultImg');
const sourcePlace = document.getElementById('sourcePlace');
const resPlace = document.getElementById('resPlace');
const dragOverlay = document.getElementById('dragOverlay');

// Buttons
const uploadBtn = document.getElementById('uploadBtn');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');

// Hidden File Input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);


// =========================================
// 2. USER DATA & INITIALIZATION
// =========================================
async function initUser() {
    try {
        const userData = await AuthAPI.getCurrentUser();
        // Assuming response structure: { data: { user: { fullName, username, credits, ... } } } 
        // OR as per request simply "Fetching the profile details"
        // Let's assume the response is the user object or contains it.
        // We'll fallback to localStorage if needed or just use what api returns.

        const user = userData.data.user || userData.data || userData;

        // Update UI
        const navUsername = document.getElementById('navUsername');
        const headerCredits = document.getElementById('headerCredits');

        if (navUsername) navUsername.textContent = user.username || user.fullName || 'User';
        if (headerCredits) headerCredits.innerText = `${user.credits || 0} / ${user.subscription ? user.subscription.limit : 0}`; // Adjust based on actual response

        // Optionally update avatar if exists
        // const navAvatar = document.getElementById('navAvatar');
        // if (user.avatarUrl) navAvatar.style.backgroundImage = `url(${user.avatarUrl})`;

    } catch (error) {
        console.error("Failed to fetch user:", error);
        // Api interceptor will handle redirect if 401
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', initUser);

// =========================================
// 3. HELPER FUNCTIONS
// =========================================

function updateReadout() {
    if (outX) outX.innerText = state.x;
    if (outY) outY.innerText = state.y;
    if (outRoll) outRoll.innerText = state.rot + "°";
    if (outPitch) outPitch.innerText = state.pitch + "°";
    if (outYaw) outYaw.innerText = state.yaw + "°";
}

// *** VISUAL UPDATE: Applies 3D rotation ***
function updateVisuals() {
    if (dialRing) {
        dialRing.style.transform = `rotateZ(${state.rot}deg) rotateX(${state.pitch}deg) rotateY(${state.yaw}deg)`;
    }
    updateReadout();
}

function resetControls() {
    state = { x: 0, y: 0, rot: 0, pitch: 0, yaw: 0 };
    if (pitchIn) pitchIn.value = 0;
    if (yawIn) yawIn.value = 0;
    if (dot) dot.style.transform = 'translate(-50%, -50%)';
    updateVisuals();
}


// =========================================
// 3. DRAG AND DROP LOGIC
// =========================================
let dragCounter = 0;
let currentFile = null; // Store the currently loaded file

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

document.body.addEventListener('dragenter', () => {
    dragCounter++;
    if (dragOverlay) dragOverlay.style.display = 'flex';
});

document.body.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter === 0 && dragOverlay) {
        dragOverlay.style.display = 'none';
    }
});

document.body.addEventListener('drop', (e) => {
    dragCounter = 0;
    if (dragOverlay) dragOverlay.style.display = 'none';

    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadImage(files[0]);
    } else {
        alert("Please drop a valid image file.");
    }
});


// =========================================
// 4. EVENT LISTENERS: SLIDERS
// =========================================
if (pitchIn) pitchIn.addEventListener('input', (e) => {
    state.pitch = e.target.value;
    updateVisuals();
});

if (yawIn) yawIn.addEventListener('input', (e) => {
    state.yaw = e.target.value;
    updateVisuals();
});


// =========================================
// 5. EVENT LISTENERS: JOYSTICK & DIAL
// =========================================
let isDragDot = false;
let isDragDial = false;

function startDial(e) { isDragDial = true; e.preventDefault(); }
function startDot(e) { isDragDot = true; e.stopPropagation(); e.preventDefault(); }
function stopDrag() { isDragDot = false; isDragDial = false; }

if (dialRing) dialRing.addEventListener('mousedown', startDial);
if (dot) dot.addEventListener('mousedown', startDot);
document.addEventListener('mouseup', stopDrag);

document.addEventListener('mousemove', (e) => {
    if (!isDragDial && !isDragDot) return;

    const rect = joyWrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const maxRadius = (rect.width / 2) - 20;

    if (isDragDial) {
        // Roll (Rotate Z)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        state.rot = Math.round(angle);
        updateVisuals();
    }
    else if (isDragDot) {
        // Joystick Position
        const dist = Math.sqrt(dx * dx + dy * dy);
        let fx = dx;
        let fy = dy;

        if (dist > maxRadius) {
            fx = dx * (maxRadius / dist);
            fy = dy * (maxRadius / dist);
        }

        state.x = Math.round(fx / 2);
        state.y = Math.round(-fy / 2);

        // Since dot is child of ring, translate moves it relative to ring center
        dot.style.transform = `translate(calc(-50% + ${fx}px), calc(-50% + ${fy}px))`;
        updateReadout();
    }
});


// =========================================
// 6. BUTTON ACTIONS
// =========================================

// Elements for new features
const removeBtn = document.getElementById('removeBtn');
const resultActions = document.getElementById('resultActions');
const downloadBtn = document.getElementById('downloadBtn');
const editAgainBtn = document.getElementById('editAgainBtn');

function loadImage(file) {
    if (!file) return;
    currentFile = file; // Store for API upload
    const url = URL.createObjectURL(file);

    if (sourceImg) {
        sourceImg.src = url;
        sourceImg.style.display = 'block';
    }
    if (sourcePlace) sourcePlace.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'flex';

    if (resultImg) {
        resultImg.style.display = 'none';
        resultImg.src = '';
    }
    if (resPlace) resPlace.style.display = 'block';
    if (resultActions) resultActions.style.display = 'none';

    resetControls();
}

// ... helper logic ...

// Upload
if (uploadBtn) uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => loadImage(e.target.files[0]));

// Remove Image
if (removeBtn) removeBtn.addEventListener('click', () => {
    currentFile = null;
    if (sourceImg) {
        sourceImg.src = '';
        sourceImg.style.display = 'none';
    }
    if (sourcePlace) sourcePlace.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
    fileInput.value = ''; // Clear input so same file can be re-selected

    // Also clear result
    if (resultImg) {
        resultImg.style.display = 'none';
        resultImg.src = '';
    }
    if (resPlace) resPlace.style.display = 'block';
    if (resultActions) resultActions.style.display = 'none';
});

// Apply
if (applyBtn) applyBtn.addEventListener('click', async () => {
    if (!currentFile) {
        alert("Please upload an image first.");
        return;
    }

    const originalText = applyBtn.innerText;
    applyBtn.innerText = "Generating...";
    applyBtn.style.opacity = "0.7";
    applyBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('image', currentFile);
        formData.append('pitch', state.pitch);
        formData.append('yaw', state.yaw);
        formData.append('roll', state.rot);

        const blob = await ImageAPI.transform(formData);

        // Convert blob to URL for display
        const resultUrl = URL.createObjectURL(blob);

        if (resultImg) {
            resultImg.src = resultUrl;
            resultImg.style.display = 'block';
        }
        if (resPlace) resPlace.style.display = 'none';
        if (resultActions) resultActions.style.display = 'flex';

    } catch (error) {
        console.error("Transformation failed:", error);
        alert(getErrorMessage(error)); // Using utility from api.js
    } finally {
        applyBtn.innerText = originalText;
        applyBtn.style.opacity = "1";
        applyBtn.disabled = false;
    }
});

// Reset
if (resetBtn) resetBtn.addEventListener('click', () => {
    resetControls();
    // Do NOT clear image, just controls
});

// Download
if (downloadBtn) downloadBtn.addEventListener('click', () => {
    if (resultImg && resultImg.src) {
        const link = document.createElement('a');
        link.download = 'shift-result.png';
        link.href = resultImg.src;
        link.click();
    }
});

// Edit Again
if (editAgainBtn) editAgainBtn.addEventListener('click', () => {
    if (resultImg && resultImg.src) {
        // Move result to source
        if (sourceImg) {
            sourceImg.src = resultImg.src;
            sourceImg.style.display = 'block';
        }
        if (sourcePlace) sourcePlace.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'flex';

        // Clear result
        resultImg.style.display = 'none';
        resultImg.src = '';
        if (resPlace) resPlace.style.display = 'block';
        if (resultActions) resultActions.style.display = 'none';

        resetControls();
    }
});

// Check for image from History page
const editImage = localStorage.getItem('shift_edit_image');
if (editImage) {
    // Create a temporary image to ensure it loads before setting
    const tempImg = new Image();
    tempImg.onload = () => {
        if (sourceImg) {
            sourceImg.src = editImage;
            sourceImg.style.display = 'block';
        }
        if (sourcePlace) sourcePlace.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'flex';

        // Clear result area as if new file loaded
        if (resultImg) {
            resultImg.style.display = 'none';
            resultImg.src = '';
        }
        if (resPlace) resPlace.style.display = 'block';
        if (resultActions) resultActions.style.display = 'none';

        resetControls();
        // Clear storage
        localStorage.removeItem('shift_edit_image');
    }
    tempImg.src = editImage;
}