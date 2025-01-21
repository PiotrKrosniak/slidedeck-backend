module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/stripe-webhook',
      handler: 'stripe-webhook.handleStripeWebhook',
      config: {
        auth: false,  // Make sure the webhook is publicly accessible
        body: {
          // Disable Strapi's default body parsing to allow raw request body
          parser: {
            enabled: false,
          },
        },
      },
    },
  ],
};
