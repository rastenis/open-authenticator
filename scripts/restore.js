"use strict";
const endpoint = "https://api.mtr.lt/openauthenticator/";
import axios from "axios";
import fs from "fs-extra";
import { to } from "await-to-js";

(async () => {
  let [configError, config] = await to(fs.readJson("./config/config.json"));

  if (configError) {
    console.error(
      "Could not read config.json. You can set it up by running 'yarn setup' or by copying scripts/template/configTemplate.json and modifying the values. OAuth strategy support will not work without configuring a domain."
    );

    console.error("No configuration present. Exitting...");
    process.exit(0);

    // console.error(
    //   "Could not read config.json. Have you set it up by copying configExample.json to config/config.json and modifying the values? OAuth strategy support will not work without configuring a domain."
    // );
    // process.exit(1);
  }

  if (!config?.managed?.length) {
    console.log("Nothing to restore.");
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

  let managedStrategies = managedStrategiesTemplate,
    toInstall = [];

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

  let installErr;
  if (toInstall.length) {
    console.log("Installing required modules...");
    [installErr] = await to(
      execShellCommand(`yarn add ${toInstall.join(" ")}`)
    );
  } else {
    console.log("No modules to install.");
  }

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
