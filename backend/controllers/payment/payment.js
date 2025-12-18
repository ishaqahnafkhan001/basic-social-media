const { User } = require('../../models/user/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createSubscription = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 1. Customer Creation
        let customerId = user.verificationData?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            customerId = customer.id;

            if (!user.verificationData) user.verificationData = {};
            user.verificationData.stripeCustomerId = customerId;
            await user.save();
        }

        // 2. Create Subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{
                price: 'price_1SfUQ6PC2eezPCVpeJ7FUEvx' // Your Price ID
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card'], // <--- 🔴 THIS FIXES THE MISSING PI
            },
            expand: ['latest_invoice.payment_intent'],
        });

        // 3. Extract Invoice
        // We check if it expanded correctly, otherwise we retrieve it
        let invoice = subscription.latest_invoice;

        if (typeof invoice === 'string') {
            invoice = await stripe.invoices.retrieve(invoice, {
                expand: ['payment_intent']
            });
        }

        // 4. Handle $0 Trial
        if (invoice.amount_due === 0) {
            return res.json({
                subscriptionId: subscription.id,
                clientSecret: null,
                message: "Trial started."
            });
        }

        // 5. Final Check
        let clientSecret = null;
        if (invoice.payment_intent) {
            // If it expanded to an object, grab the secret. If string, it failed expansion (unlikely now).
            clientSecret = typeof invoice.payment_intent === 'object'
                ? invoice.payment_intent.client_secret
                : null;
        }

        // If Stripe STILL didn't give us a PI, we try to force finalize
        if (!clientSecret && invoice.status === 'open') {
            console.log("PI missing, attempting to force finalize invoice...");
            const finalized = await stripe.invoices.finalizeInvoice(invoice.id, { expand: ['payment_intent'] });
            if (finalized.payment_intent) {
                clientSecret = finalized.payment_intent.client_secret;
            }
        }

        if (!clientSecret) {
            throw new Error("Stripe failed to generate a payment key. Check if 'Cards' are enabled in your Stripe Dashboard settings.");
        }

        res.json({
            subscriptionId: subscription.id,
            clientSecret: clientSecret,
        });

    } catch (err) {
        console.error("Stripe Controller Error:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createSubscription };