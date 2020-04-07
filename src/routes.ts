import { Router } from "express";
import { frame } from "./index";
import * as strategies from "./strategies";
import config from "./config";
import { setInterval } from "timers";
import to from "await-to-js";
import { FinishedItem } from "./finished/finishedItem";
import uuid = require("uuid");

export let router = Router();

router.get("/", (req, res) => {
  res.send("OK");
});

// client_id:string         - The requesting client id.
// redirect_uri:string      - Redirect uri
// insecure:bool            - true when accessing locally (via http)
// strategy:string          - (Optional) Name of strategy to use. If not supplied, user is allowed to authenticate any of the enabled strategies.
// identity:string          - (Optional) Identity that needs to be verified. If not supplied, user will be limited to login strategy provided. If no strategy was sent in, the user can login via any available strategy.
// identityData:string      - (Optional) Stringified JSON of active identities. If not supplied, one will be returned after the authentication.
// strict:bool              - Default:true. Disallow strategy choice and force to log in via the provided strategy.
router.get("/initiate", async (req, res) => {
  console.log(
    `Initiating authorization for ${req.query.identity ?? "new user"} through ${
      req.query.strategy ?? "any strategy."
    } ${req.query.strict == true ? "(strict)" : ""}`
  );

  // TODO: check client_id

  // Checking user
  // TODO: any-identity login
  if (!req.query.identity) {
    return res.status(500).send("No identity supplied!");
  }

  if (!req.query.redirect_uri) {
    return res.status(500).send("No redirect uri provided!");
  }

  // generating token
  req.session.token = frame.pending.getToken();

  if (!strategies[req.query.strategy]) {
    return res.status(500).send("Invalid strategy!");
  }

  // directing to strategy
  let [strategyInitiationError] = await to(
    strategies[req.query.strategy].initiate(
      req.session.token,
      config.strategies[req.query.strategy],
      req.query.identity,
      req,
      res
    )
  );

  if (strategyInitiationError) {
    return res.status(500).send(strategyInitiationError);
  }

  // adding a pending authentication
  frame.pending.addPending(
    req.query.strategy,
    req.query.identity,
    req.query.redirect_uri,
    req.session.token,
    req,
    res
  );

  // TODO: allow custom pages
  return res.render("default", { strategy: req.query.strategy });
});

router.get("/status", (req, res) => {
  // Keep connection open while authorizing
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Cleanup unfinished authorization on close
  req.on("close", () => {
    console.log(`Connection closed`);
    frame.pending.cancel(req.session.token);
  });

  // Adding res to the frame.pending list
  frame.pending.attach(req.session.token, res);

  // leaving the res open.
});

router.get("/finalize", async (req, res) => {
  if (!req.query?.token) {
    return res.status(500).send("No token!");
  }

  console.log("Confirming authorization for", req.query.token);

  // If there is a finalization action, call it,
  // otherwise, just send the finalization to the client.
  const pending = frame.pending.getPending(req.query.token);

  if (strategies[pending.strategy].finalize) {
    let [strategyFinalizeError, strategyFinalizeResult] = await to(
      strategies[pending.strategy].finalize(
        pending.token,
        config.strategies[pending.strategy],
        pending.identity,
        req,
        res
      )
    );

    if (strategyFinalizeError) {
      // TODO: supress based on dev/prod.
      return res
        .status(500)
        .send(
          "Your authentication could not be finalized!" + strategyFinalizeError
        );
    }
  }

  // Handle the finalization action manually writing headers.
  if (res.headersSent) {
    console.log("Not returning");
    return;
  }

  frame.pending.confirmPending(req.query.token);

  let waitingRes = frame.pending.getRes(req.query.token);

  // Writing out a finalization
  waitingRes.write(`data: ${JSON.stringify({ finalized: true })} \n\n`);

  // TODO: check if can be redirected immediately.
  res.sendStatus(200);
});

router.get("/redirect", (req, res) => {
  if (!req.session?.token) {
    return res.status(500).send("No token!");
  }

  // If there is a finalization action, call it,
  // otherwise, just send the finalization to the client.
  if (!frame.pending.isFinalized(req.session.token)) {
    return res.status(500).send("This authorization is not finalized!");
  }

  // constructing verification
  frame.finished.addFinished(
    frame.pending.getStrategy(req.session.token),
    uuid.v4(),
    frame.pending.getIdentityData(req.session.token)
  );

  // TODO: verification for auth requester
  return res.redirect(frame.pending.getRedirectionTarget(req.session.token));
});
