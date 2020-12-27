"use strict";
const inquirer = require("inquirer");
const endpoint = "https://api.mtr.lt/openauthenticator/";
const axios = require("axios");
const fs = require("fs-extra");
const ora = require("ora");

const to = require("await-to-js").default;

(async () => {
  let [configError, config] = await to(fs.readJson("./config/config.json"));

  if (configError) {
    console.error("Could not read config.json. You can either:");
    console.error("1. Run `yarn run restore` or,");
    console.error(
      `Could not read config.json. Have you run the setup? You can do that via: ${chalk.cyan.bold(
        "yarn run config"
      )} or '${chalk.cyan.bold(
        "docker exec -it CONTAINER_NAME yarn run config"
      )}' if you are running a standalone container or as part of a composition.`
    );

    process.exit(0);
  }

  let [managedStrategiesError, managedStrategies] = await to(
    fs.readFile("./config/managed.js", "utf8")
  );

  if (managedStrategiesError) {
    console.error("Could not read managed.js. Using template...");
    [managedStrategiesError, managedStrategies] = await to(
      fs.readFile("./scripts/template/managed.js", "utf8")
    );
  }

  if (managedStrategiesError) {
    console.error("Could not read managed.js template.");
    process.exit(1);
  }

  console.log("Fetching available modules...");

  let [errModules, modules] = await to(axios(endpoint));

  if (errModules) {
    console.error("Unexpected error while fetching modules:", errModules);
    process.exit(1);
  }

  modules.data = modules.data.filter((i) => {
    return !config.managed.find((m) => {
      return m == i.replace(".json", "");
    });
  });

  if (modules.data.length == 0) {
    console.log("There are no more modules available to install! Exiting...");
    process.exit(0);
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
    let spinner = ora({
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
  let spinner = ora({
    text: `Installing required packages... (${toInstall})`,
    spinner: "triangle",
  }).start();

  let [installErr] = await to(execShellCommand(`yarn add ${toInstall}`));

  if (installErr) {
    console.error("Unexpected error while installing:", installErr);
    process.exit(1);
  }

  spinner.stop();

  if (!config.strategies) {
    config.strategies = {};
  }

  for (let index = 0; index < choices.strategies.length; index++) {
    const strat = choices.strategies[index];

    let data = await inquirer.prompt([
      {
        type: "input",
        name: "config",
        message: `${strat.name}: Go to ${strat.config} and obtain ${
          strat.customFields
            ? strat.customFields.toString()
            : "a client key and secret"
        }. Press ENTER when you're done.`,
      },
      ...(strat.customFields || ["key", "secret"]).map((c) => {
        return {
          type: "input",
          name: c,
          message: `Enter the ${c}:`,
          validate: function (value) {
            if (value.length < 1) {
              return `You must input the ${c}.`;
            }
            return true;
          },
        };
      }),
    ]);

    console.log("Injecting strategy...");
    managedStrategies = managedStrategies.replace(
      "// ======= MANAGED IMPORTS START =======",
      `// ======= MANAGED IMPORTS START ======= \n // +${strat.name.toUpperCase()}  \n ${
        strat.import
      } \n // -${strat.name.toUpperCase()} \n`
    );
    managedStrategies = managedStrategies.replace(
      "// ======= MANAGED STRATEGIES START =======",
      `// ======= MANAGED STRATEGIES START ======= \n // +${strat.name.toUpperCase()}  \n ${
        strat.strategy
      } \n // -${strat.name.toUpperCase()} \n`
    );

    let lowerCaseStrategyName = strat.name.toLowerCase();

    console.log("Setting config values...");

    if (!config.strategies[lowerCaseStrategyName]) {
      config.strategies[lowerCaseStrategyName] = {};
    }

    // assigning inputs
    for (const key in data) {
      config.strategies[lowerCaseStrategyName][key] = data[key];
    }

    // custom params
    if (strat.params) {
      config.strategies[lowerCaseStrategyName].params = strat.params;
    }
    config.managed.push(lowerCaseStrategyName);
  }

  console.log("Saving config...");
  let [configWriteError] = await to(
    fs.writeJson("./config/config.json", config)
  );

  if (configWriteError) {
    console.error("Could not write config.json. ");
    process.exit(1);
  }

  console.log("Saving new strategies...");
  let [writeStrategiesError] = await to(
    fs.writeFile("./config/managed.js", managedStrategies)
  );

  if (writeStrategiesError) {
    console.error("Could not write managed.js:", writeStrategiesError);
    process.exit(1);
  }

  //   spinner = ora({
  //     text: `Building...`,
  //     spinner: "triangle",
  //   }).start();

  //   let [buildErr] = await to(execShellCommand(`tsc`));

  //   if (buildErr) {
  //     console.error("Unexpected error while building:", buildErr);
  //     process.exit(1);
  //   }

  spinner.stop();
  console.log("Done!");

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
