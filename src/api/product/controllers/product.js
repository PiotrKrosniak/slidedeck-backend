'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    // Fetch products from the plugin table (Stripe plugin in this case)
    const ssProducts = await strapi.db.query('plugin::strapi-stripe.ss-product').findMany();

    // Loop over the products to fetch the corresponding storage data
    const enrichedProducts = await Promise.all(
      ssProducts.map(async (product) => {
        // Fetch the related storageGB information from the storage table
        const storage = await strapi.db.query('api::storage.storage').findOne({
          where: { name: product.title },  // Assuming product_id is the linking field
        });

        // Return the product along with the storage data
        return {
          ...product,
          storageGB: storage ? storage.storageGB : null, // Add storageGB to the product data
        };
      })
    );

    // Return the enriched products with storageGB included
    return enrichedProducts;
  },


  // Fetch a specific product by ID with additional data from ss-product and storage
  async findOne(ctx) {
    // Log the ID being queried
    console.log('Fetching product with ID:', ctx.params);

    // Fetch the specific product by ID
    const product = await strapi.db.query('api::product.product').findOne({
      where: { id: ctx.params.id },
    });

    // Check if the product exists
    if (!product) {
      return ctx.notFound('Product not found');
    }

    // Fetch products from the 'ss-product' table
    const ssProducts = await strapi.db.query('plugin::strapi-stripe.ss-product').findMany({
      where: { name: product.title },
    });

    // Fetch storage information matching the product title
    const storageInfo = await strapi.db.query('api::storage.storage').findMany({
      where: { title: product.title },
    });

    // Return the product data with additional ss-product and storage data
    return {
      product: product, // Include the specific product
      ssProducts: ssProducts, // Include ss-products as an array
      storageInfo: storageInfo, // Include storage information
    };
  },
}));
