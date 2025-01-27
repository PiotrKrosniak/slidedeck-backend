const AIGenerationService = require('../services/ai-generation');

module.exports = {
  async generateText(ctx) {
    try {
      const generatedText = await AIGenerationService.generateText(ctx.request.body.prompt);
      // Added hardcoded cost of 5 credits for text generation pending to create a pricing model
      await ctx.deductCredits(5);
      ctx.body = { generatedText };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  },

  async generateImage(ctx) {
    const { prompt } = ctx.request.body;
    const userId = ctx.state.user.user_id
    try {
      const imageUrl = await AIGenerationService.generateImage(prompt, userId);
      await ctx.deductCredits(10);
      ctx.body = { imageUrl };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  },

  async generateAudio(ctx) {
    const { prompt } = ctx.request.body;
    const userId = ctx.state.user.user_id
    try {
      const audioResponse = await AIGenerationService.generateAudio(prompt, userId);
      await ctx.deductCredits(10);
      ctx.body = { audioData: audioResponse };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }
};