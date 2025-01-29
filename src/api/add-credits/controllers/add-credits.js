const AddCreditsService = require('../services/add-credits');

module.exports = {
  async addCredits(ctx) {
    try {
      const user = await AddCreditsService.addCredits(ctx.request.body);
      ctx.body = { user };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  },
};