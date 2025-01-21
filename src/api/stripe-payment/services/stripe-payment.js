'use strict';

/**
 * stripe-payment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::stripe-payment.stripe-payment');
