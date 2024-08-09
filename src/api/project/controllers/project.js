"use strict";

/**
 * project controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::project.project", ({ strapi }) => ({
  async find(ctx) {
    const userId = ctx.state.user.user_id;

    // Fetch projects with pagination
    let { start = 0, limit = 30 } = ctx.query.pagination || {};
    start = parseInt(start, 10);
    limit = parseInt(limit, 10);

    const filters = {
      ...(ctx?.query?.filters || {}), // Any existing filters from the query
      user_id: userId, // Add the user_id filter
    };

    const total = await strapi.entityService.count("api::project.project", {
      filters: filters,
    });
    const data = await strapi.entityService.findMany("api::project.project", {
      ...ctx.query,
      populate: {
        project_image: true,
        user_id: true,
      },
      filters: filters,
      sort: { createdAt: "asc" },
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
        user_id: true,
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
    const userId = ctx.state.user.user_id;

    // Use the service to create the project with the image
    const project = await strapi
      .service("api::project.project")
      .create({ body: { ...body, user_id: userId }, files });

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

  // delete by project
  async delete(ctx) {
    // instead of the default id
    const { id } = ctx.params;

    const entity = await strapi.db.query("api::project.project").findOne({
      where: { project_id: id },
    });
    console.log("entityentityentity", entity);

    await strapi.entityService.delete("api::project.project", entity.id);

    return { message: "Project deleted successfully" };
  },
}));
