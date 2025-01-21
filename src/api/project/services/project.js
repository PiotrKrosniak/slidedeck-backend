"use strict";
const { v4: uuidv4 } = require("uuid");

/**
 * project service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::project.project", ({ strapi }) => ({
  async create(params) {
    // Debug log: Check if user_id is properly passed
    console.log("params.body before creation:", params.body.user_id);
    params.body = params.body || {}; // Initialize if undefined
    params.body.project_id = uuidv4();
    params.body.publishedAt = Date.now().toString();
    params.body.name = params.body.name || "Duplicate Project";
    // Set the custom user_id field if provided
    if (params.body.user_id) {
      params.body.user_id = params.body.user_id;  // Ensure user_id is retained
    }
    // Debug log: Check if user_id is retained
    console.log('params.body just before calling create:', params.body.user_id);
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

  async updateSlides(projectId, slides) {
    try {
      const project = await strapi.db.query("api::project.project").findOne({
        where: { project_id: projectId },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const updatedSlides = await Promise.all(
        slides.map(async (slide) => {
          const slidesOnDatabase = await strapi.db.query("api::slide.slide").findOne({
            where: { slide_id: slide.id },
          });

          return strapi.entityService.update("api::slide.slide", slidesOnDatabase.id, {
            data: {
              ...slide,
              objects: JSON.stringify(slide.media),
              id: slidesOnDatabase.id
            }
          });
        })
      );

      return updatedSlides.filter(slide => slide !== undefined);
    } catch (error) {
      console.error("Error updating slides:", error.message);
      throw error;
    }
  }
}));
