const AddCreditsService = require('../../add-credits/services/add-credits');

'use strict';

/**
 * stripe-payment service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreService('api::stripe-payment.stripe-payment', ({ strapi }) => ({
    ...createCoreService('api::stripe-payment.stripe-payment'),

    async handleProjectDuplicationEvent({ projectId, userId, oldUserId }) {
        try {
            if (!projectId || !userId || !oldUserId) {
                throw new Error('Missing required parameters for project duplication');
            }

            const duplicationResponse = await axios.post(`${process.env.BACKEND_URL}/api/projects/duplicate`, {
                data: {
                    originalProjectId: projectId,
                    oldUserId: oldUserId,
                    newUserId: userId,
                },
            });

            strapi.log.info('Project duplicated successfully:', duplicationResponse.data);
            return duplicationResponse.data;
        } catch (err) {
            strapi.log.error('Error duplicating project via /projects/duplicate API:', err);
            throw err;
        }
    },

    async handleCreditsPurchaseEvent({ email, credits }) {
        try {
            if (!email || !credits) {
                throw new Error('Missing required parameters for credits purchase');
            }

            const creditsResponse = AddCreditsService.handleStripeWebhook({
                email,
                credits,
            });

            strapi.log.info('Credits added successfully:', creditsResponse);
            return creditsResponse;
        } catch (err) {
            strapi.log.error('Error adding credits via /credits/add API:', err);
            throw err;
        }
    },
    async handleSubscriptionEvent({ email, credits, subscription, selectedSubscriptionTime }) {
        try {
            if (!email || !subscription) {
                throw new Error('Missing required parameters for subscription event');
            }

            // PENDING TO ADD SUBSCRIPTION API
            const subscriptionResponse = { data: 'Subscription added successfully' };

            // Add credits of subscription
            if (credits) {
                const creditsToAdd = selectedSubscriptionTime === 'year' ? credits : credits * 12;
                const creditsResponse = AddCreditsService.handleStripeWebhook({
                    email,
                    credits: creditsToAdd,
                });

                strapi.log.info('Credits added successfully:', creditsResponse);
            }

            strapi.log.info('Subscription added successfully:', subscriptionResponse.data);
            return subscriptionResponse.data;
        } catch (err) {
            strapi.log.error('Error adding subscription via /subscription/add API:', err);
            throw err;
        }
    },
})
);