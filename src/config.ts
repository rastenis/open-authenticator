let config = {} as any;

try {
  config = require("../config/config");
} catch {
  console.error(
    "No config.json detected. Did you run configuration? You can do that via: 'yarn run config' or 'docker exec -it CONTAINER_NAME yarn run config' if you are running a standalone container or as part of a composition."
  );
}

export default config;
