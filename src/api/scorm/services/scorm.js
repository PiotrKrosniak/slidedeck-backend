'use strict';

/**
 * scorm service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::scorm.scorm');
