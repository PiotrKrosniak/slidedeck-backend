'use strict';

/**
 * scorm controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { startOfDay, endOfDay } = require('date-fns');

module.exports = createCoreController('api::scorm.scorm', ({ strapi }) => ({
  async create(ctx) {
    const payload = ctx.request.body;
    console.log("values", ctx.request.body);
    const {course_name, status, userEmail} = payload.data
    // Get today's start and end timestamps
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    // Check if an entry with the same userEmail, course_name, status exists today
    const existingEntry = await strapi.db.query('api::scorm.scorm').findOne({
      where: {
        user_email: userEmail,
        course_name,
        status,
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd
        }
      }
    });
    // If entry already exists today, return a message and do not add
    if (existingEntry) {
      return ctx.send({ message: 'Entry already exists for today. Not added again.' }, 200);
    }
 
    // Otherwise, proceed with saving the new entry
    const response = await super.create(ctx); 
    return response;
  }
}));