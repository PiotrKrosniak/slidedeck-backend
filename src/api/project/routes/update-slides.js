'use strict';

module.exports = {
    "routes": [
      {
        "method": "PUT",
        "path": "/projects/:id/update-slides",
        "handler": "project.updateSlides",
        "config": {
          "policies": []
        }
      }
    ]
  }
  