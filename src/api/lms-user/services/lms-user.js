'use strict';

/**
 * lms-user service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::lms-user.lms-user');
