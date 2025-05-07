"use strict";

/**
 * project controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const copyAssetBetweenUsers = require("../services/copy-s3-objects");

module.exports = createCoreController("api::project.project", ({ strapi }) => ({
  // Find method to retrieve multiple projects
  async find(ctx) {
    // Since you're using API Token authentication, ctx.state.user is undefined.
    // We can remove user authentication checks or adjust them accordingly.

    // Correctly handle pagination
    let { start = 0, limit = 30 } = ctx.query.pagination || {};
    start = parseInt(start, 10);
    limit = parseInt(limit, 10);

    const filters = ctx.query.filters || {};

    // Fetch the total count of filtered projects
    const total = await strapi.entityService.count("api::project.project", {
      filters,
    });

    // Fetch the projects with pagination and filters applied
    const projects = await strapi.entityService.findMany("api::project.project", {
        filters,
        populate: {
          project_image: true,
          tags: true,
        },
        sort: { createdAt: "asc" },
        start,
        limit,
    });

    // Optionally, you can populate user details if needed
    // For each project, fetch the associated user details based on 'user_id' if available
    const projectWithUser = await Promise.all(
      projects.map(async (project) => {
        let user = null;
        if (project.user_id) {
          user = await strapi.entityService.findMany('plugin::users-permissions.user', {
              filters: { user_id: project.user_id },
            fields: ['id', 'username', 'email', 'user_id'],
          });
        }
        return {
          ...project,
          user, // Add user details to the project
        };
      })
    );

    return {
      data: projectWithUser,
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

    // Find the project by project_id
    const entity = await strapi.db.query("api::project.project").findOne({
      where: { project_id: id },
      populate: {
        project_image: true,
        slides: {
          select: ['id', 'name', 'slide_id', 'objects', 'thumbnail'],  // Specify only the fields you want from slides
        },
        tags: true,
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
    const userId = ctx.state.user.user_id;

    // Use the service to create the project with the image
    const project = await strapi
      .service("api::project.project")
      .create({ body: { ...body, user_id: userId }, files });

    const sanitizedEntity = await this.sanitizeOutput(project, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // // Update an existing project
  // async update(ctx) {
  //   const { id } = ctx.params;
  //   const { body } = ctx.request;
  //   const files = ctx.request?.files;

  //   // Update the project by project_id
  //   const entity = await strapi.service("api::project.project").update({
  //     where: { project_id: id },
  //     data: { ...body },
  //     files,
  //   });

  //   if (!entity) {
  //     return ctx.notFound("Project not found");
  //   }

  //   const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
  //   return this.transformResponse(sanitizedEntity);
  // },

  // Delete a project by project_id
  async delete(ctx) {
    const { id } = ctx.params;

    // Find the project by project_id
    const project = await strapi.db.query("api::project.project").findOne({
      where: { project_id: id },
    });

    if (!project) {
      return ctx.notFound("Project not found");
    }
    // Find the course by project_id
    const course = await strapi.db.query("api::course.course").findOne({
      where: { project_id: id },
    });

    // Delete the project
    await strapi.entityService.delete("api::project.project", project.id);
    // Delete the course
    if (course) {
      await strapi.entityService.delete("api::course.course", course.id);
    }
    return {
      message: course
        ? "Project and course deleted successfully"
        : "Project deleted successfully",
    };
  },
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    // Validate the incoming data (you could add specific validations here)
    if (!data) {
      return ctx.badRequest("No data provided to update");
    }

    try {
      // Update the project by project_id
      const updatedEntity = await strapi.db.query("api::project.project").update({
          where: { project_id: id },
          data,
          populate: {
            project_image: true,
            slides: {
            select: ['id', 'name', 'slide_id', 'objects', 'thumbnail'],  // Specify only the fields you want from slides
            },
            tags: true,
          },
        });

      if (!updatedEntity) {
        return ctx.notFound("Project not found");
      }

      const sanitizedEntity = await this.sanitizeOutput(updatedEntity, ctx);
      // Return only the updated fields
      return this.transformResponse({ updatedFields: data });
    } catch (error) {
      return ctx.internalServerError("An error occurred while updating the project", { error });
    }
  },
  async duplicate(ctx) {
    try {
      const { originalProjectId, oldUserId, newUserId } = ctx.request.body.data;
      console.log("originalProjectId", originalProjectId);
      console.log("oldUserId", oldUserId);
      console.log("newUserId", newUserId);

      // Fetch the original project and populate slides
      const originalProject = await strapi.db.query("api::project.project").findOne({
          where: { project_id: originalProjectId },
          populate: {
            slides: true,
          },
        });

      if (!originalProject) return ctx.badRequest("Project not found");

      // Prepare project data for duplication
      const {
        id,  // remove the original ID
        user_id,
        project_id, // remove the original project_id
        name,
        createdAt,
        updatedAt,
        publishedAt,
        slides, // handle slides separately
        ...projectData // retain other relevant fields
      } = originalProject;

      // Set fields to null or empty
      projectData.project_id = null;   // Set empty project ID (or use `null`)
      projectData.createdAt = null;  // Reset creation date
      projectData.updatedAt = null;  // Reset update date
      projectData.publishedAt = null; // Reset publication date
      projectData.user_id = newUserId;  // Set the new user
      projectData.status = "private";  // Set the new user
      projectData.deployed = false;  // Set the new user
      projectData.purchases = null;  // Set the new user
      projectData.price = null;  // Set the new user
      projectData.likes = null;  // Set the new user
      projectData.views = null;  // Set the new user
      projectData.comments = null;  // Set the new user
      projectData.name = `${name} Copy`;

      // Create the new project
      const newProject = await strapi.service("api::project.project").create({
        body: projectData
      });

      const newSlides = await Promise.all(slides.map(async (slide) => {
          const { id, name, thumbnail, slide_id, ...slideData } = slide; // Assuming 'objects' is where the assets like images are stored

          // Check if the slide has 'objects' and if it is stored as a string
        if (slideData.objects && typeof slideData.objects === 'string') {
            // Parse the stringified JSON into an array
            let objectsArray = JSON.parse(slideData.objects);

            // Iterate through the objects array and update URLs
          const updatedObjects = await Promise.all(objectsArray.map(async (obj) => {
                if (obj.src) {
                  console.log("Starting to copy asset");
              const newAssetUrl = await strapi.service("api::project.copy-s3-objects").copyAssetBetweenUsers(obj.src, oldUserId, newUserId);
                  obj.src = newAssetUrl; // Update the src with the new URL
                }
                return obj; // Return the updated object
          }));

            // Stringify the updated objects array back into a JSON string
            slideData.objects = JSON.stringify(updatedObjects);
          }

          slideData.name = `${name} Copy`;
          slideData.project_id = newProject.project_id;

          // Create the new slide with updated asset URLs
          return await strapi.service("api::slide.slide").create({
          data: slideData
          });
      }));

      // Attach duplicated slides to the new project
      await strapi.db.query("api::project.project").update({
        where: { id: newProject.id },
        data: { slides: newSlides.map(slide => slide.id) }
      });

      // Optionally return the new project with duplicated slides
      newProject.slides = newSlides;
      return ctx.send(newProject);
    } catch (error) {
      console.error(error);
      ctx.throw(500, error);
    }
  },

  async updateSlides(ctx) {
    try {
      const { id } = ctx.params;
      const { slides } = ctx.request?.body;

      const updatedSlides = await strapi
        .service("api::project.project")
        .updateSlides(id, slides);

      ctx.send({
        message: "Slides updated successfully",
        data: updatedSlides,
      });
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },
}));
