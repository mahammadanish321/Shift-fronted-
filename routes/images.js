// routes/images.js
// Handles image transformation and processing API calls

const ImageAPI = {
    /**
     * Transforms an image based on pitch, yaw, and roll.
     * @param {FormData} imageData - Contains 'image' (file), 'pitch', 'yaw', 'roll'.
     * @returns {Promise} Axios response data containing the transformed image.
     */
    transform: async (imageData) => {
        try {
            const response = await api.post('/images/transform', imageData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob' // Expecting an image back
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
