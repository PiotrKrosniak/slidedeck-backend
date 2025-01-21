'use strict';

/**
 * stripe-payment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const stripe = require('stripe')(process.env.STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY);  // Initialize Stripe with the secret key

module.exports = createCoreController('api::stripe-payment.stripe-payment', ({ strapi }) => ({
  // Custom action to create a Stripe Checkout session
  async createCheckoutSession(ctx) {
    try {
      const { amount, successUrl, cancelUrl, customerEmail } = ctx.request.body;

      // Convert amount to cents (Stripe requires the amount to be in the smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      // Create a new price object dynamically based on the user-defined amount
      const price = await stripe.prices.create({
        unit_amount: amountInCents, // Amount defined by the user in the frontend
        currency: 'eur',            // Set your currency
        product: 'prod_R4nHFff2zepNDu', // Use the product ID you created in Stripe (replace with actual ID)
      });
      console.log("price", price);
      // Create a new Stripe Checkout session using the dynamically created price
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: price.id,  // Use the dynamically created price ID
            quantity: 1,
          },
        ],
        customer_email: customerEmail, // Optional: Pre-fill the customer’s email if available
        success_url: successUrl,       // Redirect here on successful payment
        cancel_url: cancelUrl,         // Redirect here if the user cancels payment
      });
      console.log("session", session);
      // Return the session ID and URL for the frontend
      ctx.send({
        id: session.id,
        url: session.url, // Stripe Checkout URL
      });
    } catch (err) {
      console.log(err);
      ctx.send({ error: 'Failed to create checkout session' }, 500);
    }
  },
}));
