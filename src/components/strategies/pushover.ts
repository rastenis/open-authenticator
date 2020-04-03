import config from "../../config";
import * as pending from "../pending";
import * as Push from "pushover-notifications";

let conf = config.methods.find(i => {
  return i.type == "pushover";
});

const push = new Push({
  user: conf.user,
  token: conf.token
});

export async function initiate(strategyData, userData: any, req, res) {
  // resolving user (user device in this case. This could also be fetched from a database)
  let device = userData.device || req.query.identity;

  // TODO: generating state
  let state = pending.getToken();

  // registering pending
  pending.addPending("pushover", state, res);

  // send out a notification that redirect the user to /authenticate/{token}
  push.send({
    user: strategyData.user,
    message: `Verification request. Click here.`,
    title: `Verification request. Click here.`,
    url: `${config.url}/authenticate/${strategyData.user}`,
    sound: "pushover",
    device: device,
    priority: 1
  });
}

export async function finalize(req: string) {}
