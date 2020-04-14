"use strict";
const inquirer = require("inquirer");
const endpoint = "https://api.mtr.lt/openauthenticator/";

(async () => {
  let choices = await inquirer.prompt([
    {
      type: "checkbox",
      message: "Select modules to install:",
      name: "strategies",
      choices: [
        {
          name: "Google",
        },
        {
          name: "Twitter",
        },
        {
          name: "Github",
        },
      ],
      validate: function (answer) {
        if (answer.length < 1) {
          return "You must choose at least one strategy.";
        }

        return true;
      },
    },
  ]);

  console.log(JSON.stringify(choices, null, "  "));

  for (let index = 0; index < choices.strategies.length; index++) {
    const element = choices.strategies[index];
    console.log(endpoint + element.toLowerCase());
  }
})();
