'use strict';

module.exports = (strapi) => {
  return async (ctx, next) => {
    // Get the authenticated user
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to access this resource');
    }

    try {
      // Fetch the user's credits from the database
      const userProfile = await strapi.query('plugin::users-permissions.user').findOne({ 
        where: { id: user.id },
        populate: { credits: true }
      });

      // Check if the user has sufficient credits
      if (!userProfile.credits || userProfile.credits.amount <= 0) {
        return ctx.forbidden('Insufficient credits to perform this action');
      }

      // Attach a method to deduct credits after successful generation
      ctx.deductCredits = async (cost) => {
        try {
          await strapi.query('plugin::users-permissions.user').update({
            where: { id: user.id },
            data: {
              credits: {
                amount: userProfile.credits.amount - cost
              }
            }
          });
        } catch (error) {
          strapi.log.error('Error deducting credits:', error);
          throw new Error('Failed to deduct credits');
        }
      };

      // Continue to the next middleware or route handler
      await next();
    } catch (error) {
      strapi.log.error('Credits middleware error:', error);
      return ctx.badRequest('Error checking user credits');
    }
  };
};