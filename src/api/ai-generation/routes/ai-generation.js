'use strict';

module.exports = {
    "routes": [
      {
        "method": "POST",
        "path": "/ai-generation/generate-text",
        "handler": "ai-generation.generateText",
        "config": {
          "policies": []
        }
      },
      {
        "method": "POST", 
        "path": "/ai-generation/generate-image",
        "handler": "ai-generation.generateImage",
        "config": {
          "policies": []
        }
      },
      {
        "method": "POST",
        "path": "/ai-generation/generate-audio",
        "handler": "ai-generation.generateAudio",
        "config": {
          "policies": []
        }
      }
    ]
  }