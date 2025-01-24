const OpenAI = require('openai').default;
const { v4: uuidv4 } = require('uuid');

const S3_BUCKET_NAME = "slidesdeck";

class AIGenerationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.S3AWSStorageService = require('../../s3-aws-storage/services/s3-aws-storage');
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

  async generateAudio(prompt, userId) {
    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: prompt
      });
      const fileName = `${userId}/audio_list/user_upload_${uuidv4()}_$ai_audio_${uuidv4().substring(0, 6)}.mp3`;
      
      // Convert ArrayBuffer to Buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: 'audio/mp3',
      };
      
      const audioURL = await this.S3AWSStorageService.handleAudioUpload(fileName, params);
      return audioURL;
    } catch (error) {
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }
}

module.exports = new AIGenerationService();