"use strict";
const endpoint = "https://api.mtr.lt/openauthenticator/";
const axios = require("axios");
const fs = require("fs-extra");

const to = require("await-to-js").default;

(async () => {
  let [configError, config] = await to(fs.readJson("./config/config.json"));

  if (configError) {
    console.error(
      "Could not read config.json. Have you set it up by copying configExample.json and modifying the values? OAuth strategy support will not work without configuring a domain."
    );
    process.exit(0);
  }

  // TEMPLATE
  console.log("Generating managed.js...");

  const [managedStrategiesTemplateError, managedStrategiesTemplate] = await to(
    fs.readFile("./scripts/template/managed.js", "utf8")
  );

  if (managedStrategiesTemplateError) {
    console.error(
      "Could not read template for managed.js. Unrecoverable. Reset the repo."
    );
    process.exit(1);
  }

  const managedStrategies = managedStrategiesTemplate;

  const toInstall = [];

  // Processing all config.managed entries
  for (const element of config.managed) {
    const [err, res] = await to(
      axios(endpoint + element.toLowerCase() + ".json")
    );

    if (err) {
      console.error("Unexpected element fetching error:", err);
      process.exit(1);
    }

    const strat = res.data;
    strat.name = element;

    console.log(`Restoring strategy ${element}...`);
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

    // Queing install
    toInstall.push(strat.install);
  }

  console.log("Installing required modules...");
  let [installErr] = await to(
    execShellCommand(`yarn add ${toInstall.join(" ")}`)
  );

  if (installErr) {
    console.error("Unexpected error while installing modules:", installErr);
    process.exit(1);
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
  const [writeStrategiesError] = await to(
    fs.writeFile("./config/managed.js", managedStrategies)
  );

  if (writeStrategiesError) {
    console.error("Could not write managed.js:", writeStrategiesError);
    process.exit(1);
  }

  // No need to build anymore; The managed strategies are external .js
  //   const [buildErr] = await to(execShellCommand(`tsc`));

  //   if (buildErr) {
  //     console.error("Unexpected error while building:", buildErr);
  //     process.exit(1);
  //   }

  console.log("Done!");

  process.exit(0);
})();

// Unused at the moment
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
