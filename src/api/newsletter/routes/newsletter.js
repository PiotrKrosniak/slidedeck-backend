'use strict';

/**
 * newsletter router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::newsletter.newsletter');
'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/newsletters/confirm',
      handler: 'newsletter.confirm',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Include other custom routes if necessary
  ],
};