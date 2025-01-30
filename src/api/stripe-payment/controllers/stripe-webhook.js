const stripe = require('stripe')(process.env.STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY); // Ensure Stripe secret key is in your .env file
const axios = require('axios');
const AddCreditsService = require('../../add-credits/services/add-credits');

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
        // Ensure metadata fields are present
        const projectId = session.metadata.projectId;
        const userId = session.metadata.userId;
        const oldUserId = session.metadata.oldUserId;

        if (projectId && userId && oldUserId) {
          console.log('Project ID:', projectId);
          console.log('User ID:', userId);
          console.log('Old User ID:', oldUserId);

          try {
            // Call the existing Strapi API endpoint to duplicate the project
            const duplicationResponse = await axios.post(`${process.env.BACKEND_URL}/api/projects/duplicate`, {
              data: {
                originalProjectId: projectId,
                oldUserId: oldUserId,
                newUserId: userId,
              },
            });

            console.log('Project duplicated successfully:', duplicationResponse.data);
          } catch (err) {
            console.error('Error duplicating project via /projects/duplicate API:', err);
          }
        } else {
          console.error('Missing metadata fields for project duplication.');
        }
      }

      // PENDING TO IMPLEMENT TO ADD CREDITS TO USER DEPENDING ON THE SUBSCRIPTION PLAN

      await AddCreditsService.handleStripeWebhook({
        email: session.customer_details.email,
        credits: session.metadata.credits
      });
    }

    // handle subscription payment succeeded event
    if (event.type === 'invoice.payment_succeeded') {
      // PENDING TO IMPLEMENT TO ADD CREDITS TO USER DEPENDING ON THE SUBSCRIPTION PLAN
      // AND UPDATE THE USER'S SUBSCRIPTION STATUS
    }

    // handle credits purchase event pending to check if event is correct and removed hard coded credits
    if (event.type === 'payment_intent.succeeded') {
      const session = event.data.object;
      const body = {
        email: session.customer_details.email,
        credits: session.metadata.credits,
      }

      AddCreditsService.handleStripeWebhook(body)
    }

    // Return 200 to acknowledge receipt of the event
    ctx.send({ received: true });
  },
};
