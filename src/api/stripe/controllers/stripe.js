const StripeService = require('../services/stripe');

module.exports = {
  async getCreditAndSubscriptionPlans(ctx) {
    try {
      const { oneTimeProducts, subscriptions } = await StripeService.getCreditAndSubscriptionPlans();
      ctx.body = { oneTimeProducts, subscriptions };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  },
};