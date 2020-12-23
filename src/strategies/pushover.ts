import config from "../config";
import * as Push from "pushover-notifications";
import { Request, Response } from "express";

// This is an example of what a custom strategy might look like for open-authenticator.
// Pushover delivers notifications, so the initialization action is just sending the finalization link.

// This is what you would put in config.strategies for Pushover to work::
// "pushover": {
//   "user": "PUSHOVER_USER",
//   "token": "PUSHOVER_TOKEN",
// }

let push,
  conf = config.strategies?.pushover;

if (conf) {
  push = new Push({
    user: conf.user,
    token: conf.token,
  });
}

export const timeout = 60;

export const requiresIdentity = true;

export async function initiate(
  token: string,
  strategyData: any,
  identity: string,
  req: Request,
  res: Response
) {
  // resolving user (user device in this case. This could also be fetched from a database)
  let device = identity;

  // send out a notification that redirect the user to /authenticate/{token}
  push.send({
    user: strategyData.user,
    message: `Verification request. Click here.`,
    title: `Verification request. Click here.`,
    url: `${config.url}/finalize?token=${token}`,
    sound: "pushover",
    device: device,
    priority: 1,
  });
}

export async function finalize(
  token: string,
  strategyData: any,
  identity: string,
  req: Request,
  res: Response
) {
  return;
}
