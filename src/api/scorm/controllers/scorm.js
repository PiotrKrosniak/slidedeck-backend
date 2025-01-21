'use strict';

/**
 * scorm controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::scorm.scorm', ({ strapi }) => ({
  // Extend the default create action to include logging
  async create(ctx) {
    // Log the POST request payload (body of the request)
    console.log('POST request received:', ctx.request.body);

    // Call the default core create action
    const response = await super.create(ctx);

    // Log the response (after saving to the database)
    console.log('Response after saving to database:', response);

    // Return the response to the client
    return response;
  },
}));

