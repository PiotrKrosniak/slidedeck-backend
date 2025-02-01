const OpenAI = require('openai').default;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    // Inicialización si es necesaria
  }

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
}

module.exports = new StripeService();