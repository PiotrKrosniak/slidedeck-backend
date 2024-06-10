const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to the models.json file
const modelsFilePath = path.join(__dirname, "models.json");

// Read the models.json file
fs.readFile(modelsFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading models.json file:", err);
    return;
  }

  // Parse the JSON data
  const models = JSON.parse(data);

  // Function to generate model and migration
  const generateModelAndMigration = (name, attributes) => {
    const attributesArray = Object.entries(attributes).map(([key, value]) => {
      return `${key}:${value}`;
    });

    const attributesStr = attributesArray.join(",");

    const command = `npx sequelize-cli model:generate --name ${name} --attributes ${attributesStr}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Check if the model already exists
        if (stderr.includes("already exists")) {
          console.log(`Model ${name} already exists. Skipping generation.`);
          return;
        } else {
          console.error(`Error generating model ${name}:`, error);
          return;
        }
      }
      console.log(`Model ${name} generated successfully:\n${stdout}`);
    });
  };

  // Loop through each model and generate it
  models.forEach((model) => {
    generateModelAndMigration(model.name, model.attributes);
  });
  // After generating models, run migrations
  runMigrations();
});

// Function to run pending migrations
const runMigrations = () => {
  const command = "npx sequelize-cli db:migrate";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error running migrations:", error);
      return;
    }
    console.log("Migrations applied successfully:\n", stdout);
  });
};

