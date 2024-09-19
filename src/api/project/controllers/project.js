"use strict";

/**
 * project controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::project.project", ({ strapi }) => ({
  // Find method to retrieve multiple projects
  async find(ctx) {
    const userId = ctx.state.user ? ctx.state.user.user_id : null;

    // Handle the case where the user is not authenticated or user_id is missing
    if (!userId) {
      return ctx.unauthorized("User not authenticated or user_id missing.");
    }

    // Handle pagination from the query
    let { start = 0, limit = 30 } = ctx.query.pagination || {};
    start = parseInt(start, 10);
    limit = parseInt(limit, 10);

    const filters = {
      ...(ctx.query.filters || {}),
      user_id: userId, // Filter by the custom user_id (UUID)
    };

    // Fetch the total count of filtered projects
    const total = await strapi.entityService.count("api::project.project", {
      filters,
    });

    // Fetch the projects with pagination and filters applied
    const projects = await strapi.entityService.findMany("api::project.project", {
      filters,
      populate: {
        project_image: true, // Populate project_image field
        user_id: true, // Populate user_id relation
      },
      sort: { createdAt: "asc" },
      start,
      limit,
    });

    return {
      data: projects,
      meta: {
        start,
        limit,
        total,
      },
    };
  },

  // Find one project by project_id
  async findOne(ctx) {
    const { id } = ctx.params;

    // Find the project by project_id, ensuring user_id is populated
    const entity = await strapi.db.query("api::project.project").findOne({
      where: { project_id: id }, // Assuming project_id is the custom field
      populate: {
        user_id: true, // Populate user_id relation
        slides: true, // Populate slides if it's related
      },
    });

    if (!entity) {
      return ctx.notFound("Project not found");
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Create a new project
  async create(ctx) {
    const { body } = ctx.request;
    const files = ctx.request.files;
    const userId = ctx.state.user ? ctx.state.user.user_id : null;

    if (!userId) {
      return ctx.unauthorized("User not authenticated or user_id missing.");
    }

    // Create a new project with user_id and associated files
    const project = await strapi.service("api::project.project").create({
      data: { ...body, user_id: userId }, // Ensure user_id is included in the project data
      files,
    });

    const sanitizedEntity = await this.sanitizeOutput(project, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Update an existing project
  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    const files = ctx.request?.files;

    // Update the project by project_id
    const entity = await strapi.service("api::project.project").update({
      where: { project_id: id }, // Use project_id to update
      data: { ...body },
      files,
    });

    if (!entity) {
      return ctx.notFound("Project not found");
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Delete a project by project_id
  async delete(ctx) {
    const { id } = ctx.params;

    // Find the project by project_id
    const entity = await strapi.db.query("api::project.project").findOne({
      where: { project_id: id },
    });

    if (!entity) {
      return ctx.notFound("Project not found");
    }

    // Delete the project
    await strapi.entityService.delete("api::project.project", entity.id);
    return { message: "Project deleted successfully" };
  },
}));
