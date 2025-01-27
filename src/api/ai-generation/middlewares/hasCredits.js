'use strict';

/**
 * `hasCredits` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to access this resource');
    }

    try {
      // Fetch user's credits from the database
      const userProfile = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
      });

      if (!userProfile || !userProfile.credits || userProfile.credits <= 0) {
        return ctx.forbidden('Insufficient credits to perform this action');
      }

      let creditsModified = false;
      ctx.deductCredits = async (cost) => {
        if (creditsModified) {
          throw new Error('Credits have already been deducted for this operation');
        }

        if (cost > userProfile.credits) {
          throw new Error('Not enough credits to deduct the requested amount');
        }

        try {
          await strapi.db.query('plugin::users-permissions.user').update({
            where: { id: user.id },
            data: {
              credits: userProfile.credits - cost,
            },
          });
          creditsModified = true;
        } catch (error) {
          strapi.log.error('Error deducting credits:', error);
          throw new Error('Failed to deduct credits');
        }
      };

      await next();

      delete ctx.deductCredits;
    } catch (error) {
      strapi.log.error('Credits middleware error:', error);
      return ctx.badRequest('Error checking user credits');
    }
  };
};
