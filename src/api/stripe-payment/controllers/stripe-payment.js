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
  async createCheckoutSessionForCredits(ctx) {
    try {
      const { successUrl, cancelUrl, customerEmail, productId } = ctx.request.body;

      // Fetch the existing price(s) associated with the product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 1, // Assuming you need the latest price
      });

      if (!prices.data.length) {
        return ctx.send({ error: 'No active price found for this product' }, 400);
      }

      const product = await stripe.products.retrieve(productId);

      // Extract the number of credits from the product metadata
      const credits = product.metadata.credits ? parseInt(product.metadata.credits, 10) : 0;

      const priceId = prices.data[0].id; // Use the existing price ID

      // Create a new Stripe Checkout session using the existing price
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: priceId, // Use the existing price ID
            quantity: 1,
          },
        ],
        metadata: {
          credits,
        },
        customer_email: customerEmail, // Optional: Pre-fill the customer’s email if available
        success_url: successUrl,       // Redirect here on successful payment
        cancel_url: cancelUrl,         // Redirect here if the user cancels payment
      });

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
  async createCheckoutSessionForSubscriptions(ctx) {
    try {
      const { successUrl, cancelUrl, customerEmail, productId, priceId } = ctx.request.body;

      const product = await stripe.products.retrieve(productId);

      // Extract the number of credits from the product metadata
      const credits = product.metadata.credits ? parseInt(product.metadata.credits, 10) : 0;
      const price = await stripe.prices.retrieve(priceId);

      // Create a new Stripe Checkout session using the existing price
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId, // Use the existing price ID
            quantity: 1,
          },
        ],
        metadata: {
          credits,
          selectedSubscriptionTime: price.recurring.interval,
        },
        customer_email: customerEmail, // Optional: Pre-fill the customer’s email if available
        success_url: successUrl,       // Redirect here on successful payment
        cancel_url: cancelUrl,         // Redirect here if the user cancels payment
      });

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
