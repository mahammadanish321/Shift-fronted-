// js/pricing.js

document.addEventListener('DOMContentLoaded', () => {
    // --- LOAD USER (for header) ---
    // (Optional: You can reuse initUser logic from other files if you export it)
    initUser();

    // --- PAYMENT HANDLER ---
    const buttons = document.querySelectorAll('.pricing-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const plan = e.target.getAttribute('data-plan');
            const price = parseInt(e.target.getAttribute('data-price'));

            if (!plan || !price) return;

            // Change button text
            const originalText = e.target.innerText;
            e.target.innerText = "Processing...";
            e.target.disabled = true;

            try {
                // 1. Create Order
                const orderPayload = {
                    amount: price // Backend expects number (e.g. 499)
                };

                const orderResponse = await PaymentAPI.createOrder(orderPayload);
                // Response structure based on logged output: { statusCode: 200, data: { id, amount, currency, ... }, ... }
                // We access the nested .data property.
                const orderData = orderResponse.data;

                // 2. Open Razorpay
                const options = {
                    "key": "rzp_test_S0DlVD4IpPotRr", // Hardcoded Key ID as per request
                    "amount": orderData.amount,
                    "currency": orderData.currency || "INR",
                    "name": "Shift",
                    "description": `Upgrade to ${plan} Plan`,
                    "order_id": orderData.id,
                    "handler": async function (response) {
                        // 3. Verify Payment
                        try {
                            e.target.innerText = "Verifying...";
                            const verifyPayload = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: plan
                            };

                            await PaymentAPI.verifyPayment(verifyPayload);

                            showToast(`Payment Successful! You are now on the ${plan} plan.`, 'success');
                            window.location.href = 'profile.html'; // Redirect to profile to see credits

                        } catch (err) {
                            console.error("Verification failed:", err);
                            showToast("Payment verification failed. Please contact support.", 'error');
                            e.target.innerText = originalText;
                            e.target.disabled = false;
                        }
                    },
                    "prefill": {
                        // We could prefill if we have user data
                        // "name": "Gaurav Kumar",
                        // "email": "gaurav.kumar@example.com",
                        // "contact": "9999999999"
                    },
                    "theme": {
                        "color": "#3399cc"
                    },
                    "modal": {
                        "ondismiss": function () {
                            e.target.innerText = originalText;
                            e.target.disabled = false;
                        }
                    }
                };

                const rzp1 = new Razorpay(options);
                rzp1.open();

            } catch (error) {
                console.error("Order creation failed:", error);
                showToast("Failed to initiate payment. Please try again. " + getErrorMessage(error), 'error');
                e.target.innerText = originalText;
                e.target.disabled = false;
            }
        });
    });
});

async function initUser() {
    try {
        // Reuse auth logic for header
        const userData = await AuthAPI.getCurrentUser();
        const user = userData.data.user || userData.data || userData;

        const navUsername = document.getElementById('navUsername');
        const headerCredits = document.getElementById('headerCredits');

        if (navUsername) navUsername.innerText = user.username || user.fullName || 'User';
        if (headerCredits) {
            const limit = user.subscription && user.subscription.limit ? user.subscription.limit : 5;
            headerCredits.innerText = `${user.credits || 0} / ${limit}`;
        }

        const navAvatar = document.getElementById('navAvatar');
        const avatarUrl = user.avatar || user.avatarUrl;
        if (navAvatar && avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
            navAvatar.style.backgroundImage = `url('${avatarUrl}')`;
            navAvatar.style.backgroundSize = 'cover';
        }

    } catch (e) {
        // If not logged in, maybe redirect to login or show defaults
        console.log("User not logged in or error:", e);
    }
}
