"use strict";
const { v4: uuidv4 } = require("uuid");

/**
 * slide service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::slide.slide", ({ strapi }) => ({
  async create(params) {
    // Generate a new UUID for the slide
    params.data.slide_id = params.data.slide_id || uuidv4();

    // Set the published date
    params.data.publishedAt = Date.now().toString();

    // Find the project using the provided project
    const project = await strapi.db.query("api::project.project").findOne({
      where: { project_id: params.data.project_id },
    });

    // If the project does not exist, throw an error
    if (!project) {
      throw new Error("Invalid project");
    }

    // Set the project's id in the slide data
    params.data.project_id = project.id;

    // Create the slide with the updated data
    const results = await strapi.entityService.create("api::slide.slide", {
      data: params.data,
    });

    return results;
  },
  async update(params) {
    // Find the slide using the provided slide_id

    const slide = await strapi.db.query("api::slide.slide").findOne({
      where: params.where,
    });

    // If the slide does not exist, throw an error
    if (!slide) {
      throw new Error("Invalid slide");
    }

    // Update the slide with the updated data
    const results = await strapi.entityService.update(
      "api::slide.slide",
      slide.id,
      {
        data: { ...slide, ...params.data },
      }
    );

    return results;
  },
}));
