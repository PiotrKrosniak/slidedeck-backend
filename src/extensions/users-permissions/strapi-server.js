module.exports = (plugin) => {
  plugin.controllers.auth.googleAuth = async (ctx) => {
    try {
      const { id_token } = ctx.request.body;
      if (!id_token) {
        return ctx.badRequest("ID token is missing");
      }
      const parseJwt = (token) => {
        return JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
      };
      const tokenInfo = parseJwt(id_token);
      const { email } = tokenInfo;
      let user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { email } });

      if (!user) {
        const roles = await strapi.plugins[
          "users-permissions"
        ].services.role.find();
        const role = roles.find((i) => i.type === "authenticated")?.id;
        // Create a new user if not found
        user = await strapi.plugins["users-permissions"].services.user.add({
          username: email?.split("@")?.[0],
          email,
          provider: "google",
          password: null, // You might want to generate a random password or handle this differently
          confirmed: true,
          role,
        });
      }
      const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
      });

      return ctx.send({ jwt, user });
    } catch (error) {
      console.error("Error in Google callback:", error);
      ctx.internalServerError(
        "An error occurred during the registration process"
      );
    }
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/google/auth/callback",
    handler: "auth.googleAuth",
    config: {
      middlewares: ["plugin::users-permissions.rateLimit"],
      prefix: "",
    },
  });

  return plugin;
};
