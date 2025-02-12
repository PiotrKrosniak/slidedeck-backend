  
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'strapi-provider-email-resend',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'), // Required
      },
      settings: {
        defaultFrom: 'no-reply@ailms.co',
        defaultReplyTo: 'no-reply@ailms.co',
      },
    }
  },
    sentry: {
      enabled: true,
      config: {
        dsn: env('SENTRY_DSN'),
        sendMetadata: true,
      },
    },    
});


