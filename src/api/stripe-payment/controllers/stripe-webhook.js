const stripe = require('stripe')(process.env.STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY); // Ensure Stripe secret key is in your .env file

module.exports = {
  async handleStripeWebhook(ctx) {
    const stripeSignature = ctx.request.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;


    let event;
    let rawBody;

    try {
      // Access the raw body using the special Symbol key
      rawBody = ctx.request.body[Symbol.for('unparsedBody')];

      // Verify the Stripe event using the raw body
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return ctx.send({ error: 'Webhook signature verification failed' }, 400);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Session:', session);

      if (session.mode !== 'subscription') {

        // handle marketplace project duplication event
        // Ensure metadata fields are present
        const projectId = session.metadata.projectId;
        const userId = session.metadata.userId;
        const oldUserId = session.metadata.oldUserId;

        if (projectId && userId && oldUserId) {
          strapi.service('api::stripe-payment.stripe-payment').handleProjectDuplicationEvent({
            projectId,
            userId,
            oldUserId,
          })
        } else {
          console.error('Missing metadata fields for project duplication.');
        }

        const credits = session.metadata.credits;

        if (credits) {
          strapi.service('api::stripe-payment.stripe-payment').handleCreditsPurchaseEvent({
            email: session.customer_details.email,
            credits,
          });
        }
      }

      else if (session.mode === 'subscription') {
        strapi.service('api::stripe-payment.stripe-payment').handleSubscriptionEvent({
          email: session.customer_details.email,
          subscription: session.subscription,
          credits: session?.metadata?.credits,
          selectedSubscriptionTime: session?.metadata?.selectedSubscriptionTime,
        });
      }

    }

    // Return 200 to acknowledge receipt of the event
    ctx.send({ received: true });
  },
};
