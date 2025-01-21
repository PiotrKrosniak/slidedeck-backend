'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth-otp/generate',
      handler: 'auth-otp.generateOTP',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth-otp/verify',
      handler: 'auth-otp.verifyOTP',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
