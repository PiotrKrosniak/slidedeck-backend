'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/s3/upload',
      handler: 's3-aws-storage.upload',
      config: {
        policies: [],
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/s3/delete',
      handler: 's3-aws-storage.delete',
      config: {
        policies: [],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/s3/list',
      handler: 's3-aws-storage.list',
      config: {
        policies: [],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/s3/signed-url',
      handler: 's3-aws-storage.getSignedUrl',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
}; 