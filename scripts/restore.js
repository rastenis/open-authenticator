"use strict";
const endpoint = "https://api.mtr.lt/openauthenticator/";
const axios = require("axios");
const fs = require("fs-extra");

const to = require("await-to-js").default;

(async () => {
  let [configError, config] = await to(fs.readJson("./config.json"));

  if (configError) {
    console.error(
      "Could not read config.json. Have you set it up by copying configExample.json and modifying the values? OAuth strategy support will not work without configuring a domain."
    );
    process.exit(1);
  }

  let [managedStrategiesError, managedStrategies] = await to(
    fs.readFile("./src/configs/managed.ts", "utf8")
  );

  if (managedStrategiesError) {
    console.error("Could not read managed.ts.");
    process.exit(1);
  }

  for (const element of config.managed) {
    const [err, res] = await to(
      axios(endpoint + element.toLowerCase() + ".json")
    );

    if (err) {
      console.error("Unexpected error:", err);
      process.exit(1);
    }

    let strat = res.data;
    strat.name = element;

    console.log(`Injecting strategy ${element}...`);
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
  }

  console.log("Saving config...");
  let [configWriteError] = await to(fs.writeJson("./config.json", config));

  if (configWriteError) {
    console.error("Could not write config.json. ");
    process.exit(1);
  }

  console.log("Saving new strategies...");
  let [writeStrategiesError] = await to(
    fs.writeFile("./src/configs/managed.ts", managedStrategies)
  );

  if (writeStrategiesError) {
    console.error("Could not write managed.ts:", writeStrategiesError);
    process.exit(1);
  }

  let [buildErr] = await to(execShellCommand(`tsc`));

  if (buildErr) {
    console.error("Unexpected error while building:", buildErr);
    process.exit(1);
  }

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
