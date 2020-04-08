import config from "../config";
import * as pending from "../pending/pending";
import { Request, Response } from "express";

// If a custom view needs to be served, set the name here. If not, delete this line.
// By default, a view gets passed:
// strategy - name of the strategy
// timeout  - amount of time to perform the authentication action
// identity - the identity that is being verified.
// For an example of how to include these in your page, refer to template.pug
// To pass custom arguments to the authentication view, do so in the initiation stage. Example below.
export const view = "some-view";

// Timeout that is shown in the default screen. If not supplied, no time is shown in the authentication screen.
export const timeout = 60;

export async function initiate(
  token: string,
  strategyData: any,
  identity: string,
  req: Request,
  res: Response
) {
  // send out a notification that gets the user to /authenticate/{token}
  // ...
}

export async function finalize(
  token: string,
  strategyData: any,
  identity: string,
  req: Request,
  res: Response
) {
  // /authenticate/{token} has been reached. The authentication action has been performed.
  // a simple return will finalize the flow, although more checks can be done if needed.
  return;
}
