"use strict";
const { v4: uuidv4 } = require("uuid");

/**
 * project service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::project.project", ({ strapi }) => ({
  async create(params) {
    params.body.project_id = uuidv4();
    params.body.publishedAt = Date.now().toString();
    const results = await strapi.entityService.create("api::project.project", {
      data: params.body,
    });
    if (params?.files && params?.files?.project_image) {
      await strapi.plugins["upload"].services.upload.upload({
        data: {
          refId: results.id,
          ref: "api::project.project",
          field: "project_image",
        },
        files: params.files.project_image,
      });
    }
    // Fetch the project with the populated project_image field
    const projectWithImage = await strapi.entityService.findOne(
      "api::project.project",
      results.id,
      { populate: { project_image: true } }
    );

    return projectWithImage;
  },

  async update(params) {
    // Find the project using the provided project_id

    const project = await strapi.db.query("api::project.project").findOne({
      where: params.where,
    });

    // If the project does not exist, throw an error
    if (!project) {
      throw new Error("Invalid project");
    }

    // Update the project with the updated data
    const results = await strapi.entityService.update(
      "api::project.project",
      project.id,
      {
        data: { ...project, ...(params?.data?.body || {}) },
      }
    );

    if (params?.data?.files && params?.data?.files?.project_image) {
      await strapi.plugins["upload"].services.upload.upload({
        data: {
          refId: project.id,
          ref: "api::project.project",
          field: "project_image",
        },
        files: params.data.files.project_image,
      });
    }
    // Fetch the project with the populated project_image field
    const projectWithImage = await strapi.entityService.findOne(
      "api::project.project",
      results.id,
      { populate: { project_image: true } }
    );

    return projectWithImage;
  },
}));
