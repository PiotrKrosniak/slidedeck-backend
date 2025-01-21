const { createCoreController } = require('@strapi/strapi').factories;
const { getUserStorageUsage } = require('../services/s3-service');

module.exports = createCoreController('api::payment.payment', ({ strapi }) => ({
  // Fetch a list of all payments with user info and product data
  async find(ctx) {
    
    // Fetch payments from the 'strapi-stripe' plugin's payment table
    const stripePayments = await strapi.db.query('plugin::strapi-stripe.ss-payment').findMany({
      // Add any filters, sorting, or pagination if needed
    });
   
    // Iterate over each payment to find matching user data
    const paymentsWithUser = await Promise.all(
      stripePayments.map(async (payment) => {
        // Assuming 'email' exists in the payment metadata or customer object
        const userEmail = payment.metadata?.email || payment.customerEmail; // Adjust this based on Stripe response

        if (userEmail) {
          // Fetch the user by email from the User collection
          const user = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { email: userEmail },
          });

          if (user) {
            // Add user_id and user_uuid to the payment record
            payment.user_id = user.id;
            payment.user_uuid = user.user_id;

            // Log user_uuid before calling the service
            //console.log(`Fetching storage usage for user_uuid: ${user.user_id}`);

            // Add storage used info
            const storageUsed = await getUserStorageUsage(user.user_id);
            payment.storage_used = storageUsed;
          }
        }

        return payment;
      })
    );

    // Fetch products from the 'strapi-stripe' plugin's product table
    const products = await strapi.db.query('plugin::strapi-stripe.ss-product').findMany();

    // Return the payment data with user info and product data
    return {
      data: paymentsWithUser,
      products: products, // Include products as an array
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: paymentsWithUser.length } },
    };
  },

  // Fetch a specific payment by ID with user info and product data
  async findOne(ctx) {
    const { id } = ctx.params;

    // Fetch the specific payment using the ID from the 'strapi-stripe' plugin's payment table
    const stripePayment = await strapi.db.query('plugin::strapi-stripe.ss-payment').findOne({
      where: { id },
    });

    if (!stripePayment) {
      return ctx.notFound();
    }

    // Assuming 'email' exists in the payment metadata or customer object
    const userEmail = stripePayment.metadata?.email || stripePayment.customer_email; // Adjust this based on Stripe response

    if (userEmail) {
      // Fetch the user by email from the User collection
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: userEmail },
      });

      if (user) {
        // Add user_id and user_uuid to the payment record
        stripePayment.user_id = user.id;
        stripePayment.user_uuid = user.user_id;

        // Log user_uuid before calling the service
        console.log(`Fetching storage usage for user_uuid: ${user.user_id}`);

        // Add storage used info
        const storageUsed = await getUserStorageUsage(user.user_id);
        stripePayment.storage_used = storageUsed;
      }
    }

    // Fetch products from the 'strapi-stripe' plugin's product table
    const products = await strapi.db.query('plugin::strapi-stripe.ss-product').findMany();

    // Return the payment data with user info and product data
    return {
      data: stripePayment,
      products: products, // Include products as an array
    };
  },
}));
