'use strict';


module.exports = {
    "routes": [
      {
        "method": "POST",
        "path": "/projects/duplicate",
        "handler": "project.duplicate",
        "config": {
          "policies": []
        }
      }
    ]
  }
  