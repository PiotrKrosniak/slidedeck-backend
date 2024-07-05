// src/api/user/content-types/user/lifecycles.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
    async beforeCreate(event) {
      const { data } = event.params;
      data.user_id = uuidv4();
    },
    async beforeUpdate(event) {
      console.log('event before', event);
    },
};
