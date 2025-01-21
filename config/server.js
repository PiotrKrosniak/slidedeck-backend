const fs = require('fs');

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://backend.ailms.co'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
 
  // ssl: { 
  //   enabled: true, 
  //   key: fs.readFileSync('/etc/letsencrypt/live/backend.ailms.co/privkey.pem', 'utf8'), 
  //   cert: fs.readFileSync('/etc/letsencrypt/live/backend.ailms.co/fullchain.pem', 'utf8'),
  // },
});
