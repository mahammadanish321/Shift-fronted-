# Shift. | Reframing Reality

![Shift Banner](https://placehold.co/1200x500/1e1e1e/FFF?text=Shift+Reframe+Reality)

> **The web-based AI tool that moves the camera _after_ the shot.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://shift-eight-phi.vercel.app)
[![Backend Repository](https://img.shields.io/badge/Backend-Repository-blue?style=for-the-badge&logo=github)](https://github.com/mahammadanish321/Shift-backend-)

## 📖 About The Project

**Shift** is a powerful AI-driven image manipulation tool designed to fix perspective issues, correct lens distortion, and adjust camera angles long after the photo has been taken. Whether it's a "Dutch angle" selfie or a wide-angle shot that stretches faces, Shift allows you to reconstruct scene geometry and reframe your reality.

It features a sleek, glassmorphic UI that provides a professional yet intuitive experience for photographers, creators, and casual users alike.

### Key Features

*   **📷 Post-Capture Camera Movement**: Adjust **Pitch**, **Yaw**, and **Roll** to change the perspective of an existing image.
*   **📐 Geometric Reconstruction**: Automatically levels horizons and fixes perspective distortions without aggressive cropping.
*   **🔍 Lens Distortion Correction**: Fixes the "stretch" effect on faces caused by wide-angle lenses.
*   **⚡ Real-time Interactive Editor**:
    *   Intuitive XY Pad and Dial controls.
    *   Precise sliders for fine-tuning.
    *   Live coordinate readouts.
*   **👤 User Account System**:
    *   Secure Login & Signup interactions.
    *   Profile management with custom avatars.
    *   **Credit System**: Manage transformation tokens.
    *   **History**: View and re-download past transformations.
*   **💳 Subscription Model**: Different tiers to unlock more credits and premium features.
*   **📱 Mobile-First Design**: Fully responsive interface that looks and feels like a native app on mobile devices.

## 🛠️ Tech Stack

**Frontend:**
*   **Core:** HTML5, CSS3 (Vanilla + CSS Variables), JavaScript (ES6+).
*   **Styling:** Modern "Glassmorphism" aesthetic, CSS Grid/Flexbox for layouts.
*   **State & Logic:** Vanilla JS with extensive DOM manipulation.
*   **API Interaction:** `Axios` for handling HTTP requests to the backend.
*   **Icons & Fonts:** FontAwesome 6, Google Fonts (Space Grotesk).

**Backend (Separate Repo):**
*   Node.js & Express.
*   MongoDB (User data, Credits, History).
*   Cloudinary (Image storage & optimization).
*   Python/AI Model (Image processing engine - connected via API).

## 🚀 Getting Started

Follow these steps to get a local copy of the frontend running on your machine.

### Prerequisites

*   A modern web browser (Chrome, Firefox, Edge).
*   (Optional) VS Code with "Live Server" extension for the best development experience.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mahammadanish321/Shift-fronted-.git
    cd Shift-fronted-
    ```

2.  **Configuration**
    *   The frontend connects to a backend API. Ensure the `routes/api.js` file points to the correct backend URL (local or production).
    *   Open `routes/api.js`:
        ```javascript
        const API_BASE_URL = "http://localhost:5000"; // Or your production URL
        ```

3.  **Run the App**
    *   Simply open `index.html` in your browser.
    *   **Recommended:** Use a local development server (like Live Server in VS Code) to avoid CORS issues with file protocols.

## 🕹️ Usage

1.  **Sign Up/Login:** Create an account to receive free initial credits.
2.  **Upload Image:** On the dashboard, drag & drop or select an image to process.
3.  **Adjust Perspective:**
    *   Use the **Joystick/Dial** to change the viewing angle.
    *   Use sliders for precise **Pitch** (Vertical tilt) and **Yaw** (Horizontal rotation).
4.  **Apply Transform:** Click "Apply Transform" to send the data to the AI engine.
5.  **Download:** Once processed, compare the result and download your new image.

## 📸 Screenshots

<!-- Note: Replace these placeholder URLs with actual screenshots of your application -->

| Landing Page | Editor Interface |
|:---:|:---:|
| ![Landing Page](https://placehold.co/400x250/2d2d2d/FFF?text=Landing+Page) | ![Editor](https://placehold.co/400x250/2d2d2d/FFF?text=Editor+Interface) |

| Profile & History | Mobile View |
|:---:|:---:|
| ![Profile](https://placehold.co/400x250/2d2d2d/FFF?text=User+Profile) | ![Mobile](https://placehold.co/400x250/2d2d2d/FFF?text=Mobile+Responsive) |

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📞 Contact

**Project Link:** [https://shift-eight-phi.vercel.app](https://shift-eight-phi.vercel.app)
**Backend Repository:** [https://github.com/mahammadanish321/Shift-backend-](https://github.com/mahammadanish321/Shift-backend-)

---
*Shift © 2026. All Rights Reserved.*
