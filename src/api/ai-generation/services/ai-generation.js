const OpenAI = require('openai').default;

class AIGenerationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateText(prompt) {
    try {
      const response = await this.openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
      });
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  async generateImage(prompt) {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
      });
      return response.data[0].url;
    } catch (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  async generateAudio(prompt) {
    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: prompt,
      });
      // Assuming you want to return the audio buffer
      return response;
    } catch (error) {
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }
}

module.exports = new AIGenerationService();