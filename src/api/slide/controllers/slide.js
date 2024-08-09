"use strict";

/**
 * slide controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::slide.slide", ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;

    // Use the query to fetch slides along with their related projects using project_id
    const entities = await strapi.db.query("api::slide.slide").findMany({
      ...query,
      populate: {
        project_id: true, // Populate the project_id relation
      },
    });

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);

    return this.transformResponse(sanitizedEntities);
  },
  // Query by slide
  async findOne(ctx) {
    // thanks to the custom route we have now a slide variable
    // instead of the default id
    const { id } = ctx.params;

    const entity = await strapi.db.query("api::slide.slide").findOne({
      where: { slide_id: id },
      populate: {
        project_id: true, // Populate the project_id relation
      },
    });
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    // Use the service to update the slide
    const entity = await strapi.service("api::slide.slide").update({
      where: { slide_id: id },
      data: body.data,
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // delete by slide
  async delete(ctx) {
    // instead of the default id
    const { id } = ctx.params;

    const entity = await strapi.db.query("api::slide.slide").findOne({
      where: { slide_id: id },
    });
    await strapi.entityService.delete("api::slide.slide", entity.id);

    return { message: "Slide deleted successfully" };
  },
}));
