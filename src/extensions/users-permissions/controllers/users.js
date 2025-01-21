const { sanitize } = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils').errors;

module.exports = {
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    // Fetch user with custom fields populated
    const userWithCustomFields = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['organizations'],
    });

    if (!userWithCustomFields) {
      throw new ApplicationError('User not found');
    }

    // Fetch the product plan the user is subscribed to based on their email
    const productPlan = await strapi.db.query('plugin::strapi-stripe.ss-payment').findOne({
      where: { user_email: user.email },
      select: ['title'], // Assuming 'plan_name' is the field you want
    });

    // Sanitize the user data to prevent exposing sensitive info
    const sanitizedUser = await sanitize.contentAPI.output(userWithCustomFields);

    // Include the product plan in the response
    return ctx.send({
      ...sanitizedUser,
      productPlan: productPlan ? productPlan.plan_name : null, // Include the product plan
    });
  },
};
