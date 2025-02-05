'use strict';

module.exports = {
  "routes": [
    {
      "method": "GET",
      "path": "/stripe/get-credit-and-subscription-plans",
      "handler": "stripe.getCreditAndSubscriptionPlans",
    },
    {
      method: 'GET',
      path: '/stripe/get-subscription-status/:subscriptionId',
      handler: 'stripe.getSubscriptionStatus',
      config: {
        auth: {
          enabled: true,
        },
      }
    }
  ]
}