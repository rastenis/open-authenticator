"use strict";
const inquirer = require("inquirer");
const fs = require("fs-extra");

const to = require("await-to-js").default;

(async () => {
  let [configError, config] = await to(fs.readJson("./config/config.json"));

  if (configError) {
    console.info("Could not read config.json. Loading defaults for you...");
    const [configDefaultingError, configDefault] = await to(
      fs.readJson("./configExample.js", "utf8")
    );

    if (configDefaultingError) {
      console.error("Could not read defaults for config.json.");
      process.exit(1);
    }

    configDefault.strategies = {};

    config = configDefault;
  }

  console.log("Starting guided configuration...");

  let data = await inquirer.prompt([
    {
      type: "number",
      name: "port",
      default: 80,
      message: `Input the port you would like to use:`,
    },
    {
      type: "input",
      name: "url",
      default: "https://domain.com",
      message: `Input the URL that will point to the authenticator:`,
    },
    {
      type: "input",
      name: "ids",
      default: "EXAMPLE, EXAMPLE1",
      message: `Input a comma-separated list of allowed client IDS:`,
    },
  ]);

  config = { ...config, ...data };

  if (data.url.includes("https")) {
    console.log(
      "Using secure sessions because you are using a HTTPS endpoint."
    );
    config.sessionSecure = true;
  } else {
    console.log(
      "Using unsecure sessions. You should switch to HTTPS or use the composition mode (more in the readme) to ensure OAuth provider support."
    );
    config.sessionSecure = false;
  }

  config.client_ids = data.ids.split(",").map((e) => {
    return e.trim();
  });

  await fs.ensureDir("./config");

  console.log("Saving config...");
  let [configWriteError] = await to(
    fs.writeJson("./config/config.json", config)
  );

  if (configWriteError) {
    console.error("Could not write config.json. ");
    process.exit(1);
  }

  console.log(
    "Done! Run `yarn run strategies` to configure authentication strategies."
  );

  process.exit(0);
})();
