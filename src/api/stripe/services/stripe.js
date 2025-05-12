const stripe = require('stripe')(process.env.STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY);

class StripeService {
  async getCreditAndSubscriptionPlans() {
    try {
      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price']
      });

      const subscriptionProducts = [];
      const oneTimeProducts = [];
      const creditsPlans = [];

      for (const product of products.data) {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true
        });

        const hasSubscription = prices.data.some(price => price.type === 'recurring');

        const formattedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: product.metadata,
          default_price: product.default_price,
          prices: prices.data.map(price => ({
            id: price.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            type: price.type,
            ...(price.type === 'recurring' && { recurring: price.recurring })
          }))
        };

        if (hasSubscription) {
          subscriptionProducts.push(formattedProduct);
        } else if (product.metadata?.credits) {
          creditsPlans.push(formattedProduct);
        } else {
          oneTimeProducts.push(formattedProduct);
        }
      }

      return {
        subscriptions: subscriptionProducts,
        oneTimeProducts: oneTimeProducts,
        creditsPlans: creditsPlans
      };
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }
  async getSubscriptionStatus(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();

      for (const item of subscription.items.data) {
        const product = await stripe.products.retrieve(item.price.product);


        const teamFeature = product.marketing_features[2]?.name || '';
        const supportFeature = product.marketing_features[3]?.name || '';
        
        const teamValue = teamFeature.slice(teamFeature.indexOf(':') + 1).trim();
        const supportValue = supportFeature.slice(supportFeature.indexOf(':') + 1).trim();
        
        item.title = product.name;
        item.metadata = {
          ...product.metadata,
          team: teamValue,
          support: supportValue,
        };
      }

      subscription.next_billing_date = nextBillingDate;


      return subscription;
    } catch (error) {
      throw new Error(`Failed to retrieve subscription details: ${error.message}`);
    }
  }

  async createInvoiceItem(data) {
    return await stripe.invoiceItems.create({
      customer: data.customer,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    });
  }

  async createInvoice(data) {
    return await stripe.invoices.create({
      customer: data.customer,
      auto_advance: data.auto_advance,
    });
  }
}

module.exports = new StripeService();