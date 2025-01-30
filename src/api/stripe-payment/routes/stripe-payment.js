'use strict';

/**
 * stripe-payment router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::stripe-payment.stripe-payment');
module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/create-checkout-session',
        handler: 'stripe-payment.createCheckoutSession', // Make sure the handler points to the correct function
        config: {
          auth: false,  // Make sure this route is accessible
        },
      },
      {
        method: 'POST',
        path: '/create-checkout-session-for-credits',
        handler: 'stripe-payment.createCheckoutSessionForCredits', // Make sure the handler points to the correct function
        config: {
          auth: false,  // Make sure this route is accessible
        },
      },
    ],
  };