'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-otp.user-otp', ({ strapi }) => ({
  // Override the default 'find' method
  async find(ctx) {
    // Use the default find method from Strapi's core controller
    const { data, meta } = await super.find(ctx);
    
    return { data, meta };
  },
  
  // Override the default 'findOne' method
  async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.service('api::user-otp.user-otp').findOne(id);
    return entity ? entity : ctx.notFound('OTP not found');
  },
  
  // Override the default 'create' method (if you want custom logic for creating OTPs)
  async create(ctx) {
    const otpData = ctx.request.body;
    const otp = await strapi.service('api::user-otp.user-otp').create(otpData);
    return otp;
  },
  
  // Add more methods if needed, like update or delete
}));
