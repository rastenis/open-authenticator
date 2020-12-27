"use strict";
const fs = require("fs-extra");
const inquirer = require("inquirer");
const to = require("await-to-js").default;
const chalk = require("chalk");
const exec = require("child_process").exec;

(async () => {
  let [configError, config] = await to(fs.readJson("./config/config.json"));

  if (configError) {
    console.info("Could not read config.json. Loading defaults for you...");

    let [configDefaultingError, configDefault] = await to(
      fs.readJson("./scripts/template/configTemplate.json")
    );

    if (configDefaultingError) {
      console.error(
        "Could not read template configuration. It should be present in scripts/template/configTemplate.json."
      );
      process.exit(0);
    }

    config = configDefault;
  }

  // checking for shortcut
  const prompt = await inquirer.prompt([
    {
      type: "number",
      message: `Enter port: (Keep default 80 if using Docker)`,
      name: "port",
      default: config.port,
    },
    {
      type: "input",
      message: `Enter URL that will point to this IP/port:`,
      name: "url",
      default: config.url,
    },
    {
      type: "input",
      message: `Enter your client IDs, separated by commas:`,
      default: config.clients.join(","),
      name: "clients",
    },
    {
      type: "confirm",
      message: `Would you like to display custom strategies in the 'any' auth method menu?`,
      default: config.showCustomStrategiesInAnyAuthMenu,
      name: "showCustomStrategiesInAnyAuthMenu",
    },
    {
      type: "input",
      message: `Email for LetsEncrypt certificate generation (any email):`,
      default: "someemail@mail.com",
      name: "letsencryptEmail",
    },
  ]);

  console.log("Injecting values into docker-compose.yml...");

  // injecting docker compose values
  exec(
    `sed -i "s/DOMAIN:.*/DOMAIN: ${prompt.url
      .replace("https://", "")
      .replace("http://", "")}/g" ./docker-compose.yml`
  );
  exec(
    `sed -i "s/CERTBOT_EMAIL:.*/CERTBOT_EMAIL: ${prompt.letsencryptEmail}/g" ./docker-compose.yml`
  );

  if (prompt.url.includes("https://")) {
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

  config.port = prompt.port;
  config.sessionSecure = prompt.sessionSecure;
  config.url = prompt.url;
  config.clients = config.client_ids = prompt.clients.split(",").map((e) => {
    return e.trim();
  });
  config.showCustomStrategiesInAnyAuthMenu =
    prompt.showCustomStrategiesInAnyAuthMenu;

  config.sessionSecret = [...Array(30)]
    .map((i) => (~~(Math.random() * 36)).toString(36))
    .join("");

  console.log("Writing config...");
  await fs.writeJSON("./config/config.json", config);

  console.log(
    `Done! You can now run strategy setup, if you want help with setting up strategies.`
  );
  process.exit(0);
})();
