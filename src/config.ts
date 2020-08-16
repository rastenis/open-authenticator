export let config;
try {
  config = require("../config/config");
} catch (e) {
  console.error(
    "Configuration is not present(config/config.json). Have you run the setup?"
  );
  process.exit(1);
}
