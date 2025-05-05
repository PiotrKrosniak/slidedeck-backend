const StripeService = require('../services/stripe');

module.exports = {
  async getCreditAndSubscriptionPlans(ctx) {
    try {
      const { oneTimeProducts, creditsPlans, subscriptions } = await StripeService.getCreditAndSubscriptionPlans();
      ctx.body = { oneTimeProducts, subscriptions, creditsPlans };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  },
  async getSubscriptionStatus(ctx) {
    try {
      const subscription = await StripeService.getSubscriptionStatus(ctx.params.subscriptionId);
      ctx.body = { subscription };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  },
  async generateInvoice(ctx) {
    try {
      const { customerId, amount, description } = ctx.request.body;

      // Create an invoice item
      const invoiceItem = await StripeService.createInvoiceItem({
        customer: customerId,
        amount: amount,
        currency: 'usd',
        description: description,
      });

      // Create and finalize the invoice
      const invoice = await StripeService.createInvoice({
        customer: customerId,
        auto_advance: true,
      });

      ctx.body = {
        success: true,
        invoice: invoice
      };

    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }
};