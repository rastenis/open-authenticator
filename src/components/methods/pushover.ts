import config from "../../config";
import { authenticationModuleError } from "../pending";
import * as Push from "pushover-notifications";

let conf = config.methods.find(m => {
  return m.type === "pushover";
});

// checking config
if (!conf?.user || !conf?.token) {
  throw authenticationModuleError.missingConfiguration;
}

// definitions
const push = new Push({
  user: conf.user,
  token: conf.token
});

export async function notify(identifier: string, token: string) {
  // resolving user (user device in this case. This could also be fetched from a database)
  let device = conf.devices[identifier] || identifier;

  // send out a notification that redirect the user to /authenticate/{token}
  push.send({
    message: `Verification request.`,
    title: `Verification request.`,
    url: `${config.url}/authenticate/${token}`,
    sound: "pushover",
    device: device,
    priority: 1
  });
}
