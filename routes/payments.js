// routes/payments.js
// Handles payment related API calls

const PaymentAPI = {
    /**
     * Creates a payment order.
     * @param {Object} orderData - { amount: <number>, currency: "INR" }
     * @returns {Promise} Axios response data containing orderId and other details.
     */
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/payments/create-order', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Verifies the payment.
     * @param {Object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
     * @returns {Promise} Axios response data indicating success.
     */
    verifyPayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/verify-payment', paymentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
