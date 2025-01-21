'use strict';

/**
 * user-otp service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-otp.user-otp');
