"use strict";
const inquirer = require("inquirer");
const endpoint = "https://api.mtr.lt/openauthenticator/";
const axios = require("axios");
const fs = require("fs-extra");
const ora = require("ora");

const to = require("await-to-js").default;

(async () => {
  let [configError, config] = await to(fs.readJson("./config.json"));

  if (configError) {
    console.error(
      "Could not read config.json. Have you set it up by copying configExample.json and modifying the values? OAuth strategy support will not work without configuring a domain."
    );
    process.exit(1);
  }

  console.log("Fetching available modules...");

  let [errModules, modules] = await to(axios(endpoint));

  if (errModules) {
    console.error("Unexpected error while fetching modules:", errModules);
    process.exit(1);
  }

  let choices = await inquirer.prompt([
    {
      type: "checkbox",
      message: "Select modules to install:",
      name: "strategies",
      choices: modules.data.map((c) => {
        return {
          name: c.charAt(0).toUpperCase() + c.slice(1).replace(".json", ""),
        };
      }),
      validate: function (answer) {
        if (answer.length < 1) {
          return "You must choose at least one strategy.";
        }

        return true;
      },
    },
  ]);

  console.log("Fetching required data...");

  for (let index = 0; index < choices.strategies.length; index++) {
    const element = choices.strategies[index];
    const spinner = ora({
      text: `Fetching ${choices.strategies[index]}`,
      spinner: "triangle",
    }).start();

    let [err, res] = await to(
      axios(endpoint + element.toLowerCase() + ".json")
    );

    if (err) {
      console.error("Unexpected error:", err);
      process.exit(1);
    }
    spinner.stop();

    choices.strategies[index] = res.data;
    choices.strategies[index].name = element;
  }

  let toInstall = choices.strategies
    .map((s) => {
      return s.install;
    })
    .join(" ");
  const spinner = ora({
    text: `Installing required packages... (${toInstall})`,
    spinner: "triangle",
  }).start();

  let [installErr] = await to(execShellCommand(`yarn add ${toInstall}`));

  if (installErr) {
    console.error("Unexpected error while installing:", installErr);
    process.exit(1);
  }

  spinner.stop();

  for (let index = 0; index < choices.strategies.length; index++) {
    const strat = choices.strategies[index];

    let data = await inquirer.prompt([
      {
        type: "input",
        name: "config",
        message: `${strat.name}: Go to ${strat.config} and obtain a client key and secret. Press ENTER when you're done.`,
      },
      {
        type: "input",
        name: "key",
        message: `Enter the client key:`,
        validate: function (value) {
          if (value.length < 1) {
            return "You must input the key.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "secret",
        message: `Enter the client secret:`,
        validate: function (value) {
          if (value.length < 1) {
            return "You must input the secret.";
          }
          return true;
        },
      },
    ]);

    console.log("Injecting strategy...");
    console.log("Setting config values...");
    config.strategies[strat.name.toLowerCase()].key = data.key;
    config.strategies[strat.name.toLowerCase()].secret = data.secret;
  }

  console.log("Saving config...");
  let [configWriteError] = await to(fs.writeJson("./config.json", config));

  if (configWriteError) {
    console.error("Could not write config.json. ");
    process.exit(1);
  }

  console.log("All done! Saving...");
  process.exit(0);
})();

function execShellCommand(cmd) {
  const exec = require("child_process").exec;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}
