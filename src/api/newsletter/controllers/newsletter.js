'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::newsletter.newsletter', ({ strapi }) => ({
  // Overriding the create method
  async create(ctx) {
    try {
      const { email } = ctx.request.body.data;

      // Check if the email already exists and is confirmed
      const existingSubscription = await strapi.db.query('api::newsletter.newsletter').findOne({
        where: { email, confirmed: true },
      });

      if (existingSubscription) {
        // If the email is already confirmed, don't send the confirmation email
        return ctx.send({
          message: 'Email is already confirmed. No need to resend the confirmation link.',
        });
      }

      // Call the core create method (preserve default behavior)
      const response = await super.create(ctx);

      const confirmationLink = `${strapi.config.server.url}/api/newsletters/confirm?email=${encodeURIComponent(email)}`;

      // Send confirmation email only if it's not already confirmed
      await strapi.plugins['email'].services.email.send({
        to: email,
        subject: 'Confirm your subscription to ailms.co newsletter',
        text: `Please confirm your newsletter subscription by clicking this link: ${confirmationLink}`,
        html: `<p>Please confirm your subscription by clicking the following link: <a href="${confirmationLink}">Confirm Subscription</a></p>`,
      });

      return this.transformResponse(response);

    } catch (err) {
      console.log('Error occurred in newsletter creation:', err);
      ctx.throw(500, 'An error occurred while creating the newsletter');
    }
  },
  // Confirm subscription action
  async confirm(ctx) {
    try {
      const { email } = ctx.query;
      if (!email) {
        console.log('Email is missing in the confirmation request');
        return ctx.badRequest('Email is required');
      }

      // Decode the email address
      const decodedEmail = decodeURIComponent(email);
      console.log(`Attempting to confirm subscription for email: ${decodedEmail}`);

      const subscription = await strapi.db.query('api::newsletter.newsletter').findOne({ where: { email: decodedEmail } });
      if (!subscription) {
        console.log(`Subscription not found for email: ${decodedEmail}`);
        return ctx.notFound('Subscription not found');
      }

      // Use the Entity Service API to update the subscription
      await strapi.entityService.update('api::newsletter.newsletter', subscription.id, {
        data: { confirmed: true },
      });

      console.log(`Subscription confirmed for email: ${decodedEmail}`);
      ctx.send({ message: 'Subscription confirmed!' });
      return ctx.redirect('/');

    } catch (err) {
      console.error('Error in newsletter confirmation:', err);
      ctx.throw(500, 'An error occurred while confirming the subscription');
    }
  },
}));
