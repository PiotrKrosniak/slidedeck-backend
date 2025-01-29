'use strict';

module.exports = {
  "routes": [
    {
      "method": "POST",
      "path": "/ai-generation/generate-text",
      "handler": "ai-generation.generateText",
      "config": {
        "middlewares": ["api::ai-generation.has-credits"],
      }
    },
    {
      "method": "POST",
      "path": "/ai-generation/generate-image",
      "handler": "ai-generation.generateImage",
      "config": {
        "middlewares": ["api::ai-generation.has-credits"],
      }
    },
    {
      "method": "POST",
      "path": "/ai-generation/generate-audio",
      "handler": "ai-generation.generateAudio",
      "config": {
        "middlewares": ["api::ai-generation.has-credits"],
      }
    }
  ]
}