"use strict";
const fs = require("fs-extra");
const inquirer = require("inquirer");
const to = require("await-to-js").default;
const chalk = require("chalk");

(async () => {
  let [configError, config] = await to(
    fs.readJson("./scripts/template/configTemplate.json")
  );

  if (configError) {
    console.error(
      "Could not read template configuration. It should be present in scripts/template/configTemplate.json."
    );
    process.exit(0);
  }

  // checking for shortcut
  const prompt = await inquirer.prompt([
    {
      type: "number",
      message: `Enter port: (Keep default 80 if using Docker)`,
      name: "port",
      default: 80,
    },
    {
      type: "input",
      message: `Enter URL that will point to this IP/port:`,
      name: "url",
      default: "https://domain.com",
    },
    {
      type: "confirm",
      message: `Would you like to use secure sessions?`,
      default: true,
      name: "sessionSecure",
    },
    {
      type: "input",
      message: `Enter your client IDs, separated by commas:`,
      default: "EXAMPLE",
      name: "clients",
    },
    {
      type: "confirm",
      message: `Would you like to display custom strategies in the 'any' auth method menu?`,
      default: true,
      name: "showCustomStrategiesInAnyAuthMenu",
    },
    {
      type: "confirm",
      message: `Would you like to set up some strategies now?`,
      default: true,
      name: "doStrategySetup",
    },
  ]);

  config.port = prompt.port;
  config.sessionSecure = prompt.sessionSecure;
  config.url = prompt.url;
  config.clients = prompt.clients.split(",");
  config.showCustomStrategiesInAnyAuthMenu =
    prompt.showCustomStrategiesInAnyAuthMenu;

  config.sessionSecret = [...Array(30)]
    .map((i) => (~~(Math.random() * 36)).toString(36))
    .join("");

  console.log("Writing config...");
  await fs.writeJSON("./config/config.json", config);

  if (prompt.doStrategySetup) {
    console.log("Done! Launching strategy setup:\n\n");
    require("./strategies");
  } else {
    console.log(
      `Done! Run ${chalk.cyan.bold(
        "yarn run strategies"
      )} if you want help with setting up strategies.`
    );
    process.exit(0);
  }
})();
