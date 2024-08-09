"use strict";

/**
 * project controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::project.project", ({ strapi }) => ({
  async find(ctx) {
    // Fetch projects with pagination
    let { start = 0, limit = 10 } = ctx.query.pagination || {};
    start = parseInt(start, 10);
    limit = parseInt(limit, 10);
    const total = await strapi.entityService.count("api::project.project");
    const data = await strapi.entityService.findMany("api::project.project", {
      ...ctx.query,
      populate: {
        project_image: true,
      },
      orderBy: { updatedAt: "desc" },
      start,
      limit,
    });

    return {
      data: data,
      meta: {
        start,
        limit,
        total,
      },
    };
  },

  // Query by project
  async findOne(ctx) {
    // thanks to the custom route we have now a project variable
    // instead of the default id
    const { id } = ctx.params;

    const entity = await strapi.db.query("api::project.project").findOne({
      where: { project_id: id },
      populate: {
        slides: {
          populate: {},
        },
      },
    });
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    const { body } = ctx.request;
    const files = ctx.request.files;

    // Use the service to create the project with the image
    const project = await strapi
      .service("api::project.project")
      .create({ body, files });

    const sanitizedEntity = await this.sanitizeOutput(project, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    const files = ctx.request?.files;

    // Use the service to update the project
    const entity = await strapi.service("api::project.project").update({
      where: { project_id: id },
      data: { body, files },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },
}));
