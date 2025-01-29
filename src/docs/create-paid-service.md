How to Create a Paid Service

For creating a paid service you have to add the middleware hasCredits to the route to check if the user has credits and deduct it.

{
      "method": "POST",
      "path": "/ai-generation/generate-text",
      "handler": "ai-generation.generateText",
      "config": {
        "middlewares": ["api::ai-generation.has-credits"],
      }
}

You have to create in the database a PaidService that returns the route of the paid service, for example: "/api/ai-generation/generate-text".