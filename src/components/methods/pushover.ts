import config from "../../config";
import { authenticationModuleError } from "../pending";
import * as Push from "pushover-notifications";

let conf = config.methods.find(i => {
  return i.type == "pushover";
});

const push = new Push({
  user: conf.user,
  token: conf.token
});

export async function notify(identifier: string, userConfig: any) {
  // resolving user (user device in this case. This could also be fetched from a database)
  let device = userConfig.device || identifier;

  // send out a notification that redirect the user to /authenticate/{token}
  push.send({
    user: userConfig.user,
    message: `Verification request. Click here.`,
    title: `Verification request. Click here.`,
    url: `${config.url}/authenticate/${userConfig.user}`,
    sound: "pushover",
    device: device,
    priority: 1
  });
}
