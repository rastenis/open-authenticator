import * as chalk from "chalk";

export let config = {} as any;

try {
  config = require("../config/config");
} catch {
  console.error(
    chalk.red("config.json not present!") +
      ` Have you run the setup? You can do that via: ${chalk.cyan.bold(
        "yarn setup"
      )} or '${chalk.cyan.bold(
        "docker exec -it CONTAINER_NAME yarn setup"
      )}' if you are running a standalone container or as part of a composition.`
  );
}
