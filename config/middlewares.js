module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://ailms.co', 'http://localhost:3000'],  // Add your frontend domain here
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      keepHeaderOnError: true,
    },
  },
  'strapi::errors',
  'strapi::security',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      includeUnparsed: true,  // This enables access to the raw body
      patchKoa: true,         // Patches Koa to allow unparsed access
      multipart: true,        // Keep handling multipart requests if needed
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
