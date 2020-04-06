import { Router } from "express";
import { frame } from "../index";
import * as strategies from "./strategies";
import config from "../config";
import { setInterval } from "timers";

export let router = Router();

router.get("/", (req, res) => {
  res.send("OK");
});

// client_id:string         - The requesting client id.
// strategy:string          - Name of strategy
// redirect:string          - Redirect uri
// insecure:bool            - true when accessing locally (via http)
// identity:string          - (Optional) Identity that needs to be verified.
// strict:bool     - Default:true
router.get("/initiate", (req, res) => {
  console.log(
    `Initiating authorization for ${req.query.identity ?? "new user"} through ${
      req.query.strategy ?? "any strategy."
    }`
  );

  // TODO: check client_id

  // Checking user
  if (req.query.identity && !config.users[req.query.identity]) {
    return res.status(500).send("Invalid user!");
  }

  // TODO:
  if (!req.query.redirect) {
    return res.status(500).send("No redirect uri provided!");
  }

  req.session.token = frame.pending.getToken();
  req.session.strategy = frame.pending.getToken();

  if (!strategies[req.query.strategy]) {
    return res.status(500).send("Invalid strategy!");
  }

  // directing to strategy
  strategies[req.query.strategy].initiate(
    req.session.token,
    config.strategies[req.query.strategy],
    req.query.identity,
    req,
    res
  );

  frame.pending.addPending(
    req.session.strategy,
    req.query.identity,
    req.query.redirect,
    req.session.token
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

router.get("/finalize/:token", (req, res) => {
  if (!req.params?.token) {
    return res.status(500).send("No token!");
  }

  console.log("Confirming authorization for ", req.params.token);

  // If there is a finalization action, call it,
  // otherwise, just send the finalization to the client.
  if (strategies[req.params.token].finalize) {
    strategies[req.params.token].finalize(
      req.params,
      frame.pending.confirmPending.bind(req.params.token)
    );
  } else {
    frame.pending.confirmPending(req.params.token);
  }

  res.sendStatus(200);
});

router.get("/redirect", (req, res) => {
  if (!req.session?.token) {
    return res.status(500).send("No token!");
  }

  console.log("Confirming redirection for ", req.session.token);

  // If there is a finalization action, call it,
  // otherwise, just send the finalization to the client.
  if (!frame.pending.isFinalized(req.session.token)) {
    return res.status(500).send("This authorisation is not finalized!");
  }

  // TODO: verification
  return res.redirect(frame.pending.getRedirectionTarget(req.session.token));
});
