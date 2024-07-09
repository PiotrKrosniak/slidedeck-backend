"use strict";
const userLifeCycles = require("./extensions/users-permissions/content-types/user/lifecycles");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {

    // registering a users-permissions subscriber
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"], // optional;
      ...userLifeCycles,
    });

    // Example for another content type (e.g., post)
    // strapi.db.lifecycles.subscribe({
    //   models: ["plugin::content-type.post"], // Specify the model you want to apply lifecycles to
    //   ...postLifeCycles, // Import post lifecycle functions
    // });

  },
};
