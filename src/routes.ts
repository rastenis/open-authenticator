import { Router } from "express";
import { frame } from "./index";
import * as strategies from "./strategies";
import config from "./config";
import to from "await-to-js";
import { FinishedItem } from "./finished/finishedItem";
import * as crs from "crypto-random-string";

export let router = Router();

router.get("/", (req, res) => {
  res.send("OK");
});

/**
 * /INITIATE ROUTE QUERY PARAMETERS:
 * @param {string} client_id      - Requester's client id
 * @param {string} redirect_uri   - The desired redirect url
 * @param {boolean} insecure      - True when accessing locally (via http)
 * @param {string} strategy       - (Optional) Name of strategy to use. If not supplied, user is allowed to authenticate any of the enabled strategies.
 * @param {string} identity       - (Optional) Identity that needs to be verified. If not supplied, user will be limited to login strategy provided. If no strategy was sent in, the user can login via any available strategy.
 * @param {string} identities     - (Optional) Stringified JSON of active identities. If not supplied, one will be returned after the authentication.
 * @param {boolean} strict        - Default:true. Disallow strategy choice and force to log in via the provided strategy.
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
router.get("/initiate", async (req, res) => {
  frame.initiate(
    req.query.client_id,
    req.query.redirect_uri,
    req.query.insecure,
    req.query.strategy,
    req.query.identity,
    req.query.identities,
    req.query.strict,
    req,
    res
  );
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
  if (!pending) {
    return res.status(500).send("No such pending authorization!");
  }

  // Performing finalization
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

    // attaching the identity data
    frame.pending.addIdentity(
      req.query.token,
      pending.strategy,
      strategyFinalizeResult
    );
  }

  // Strategy did not handle the identity data, so we only add the identifier as data.
  frame.pending.addIdentity(
    req.query.token,
    pending.strategy,
    pending.identity
  );

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
  let code = crs({ length: 20, type: "numeric" });
  frame.finished.addFinished(
    frame.pending.getStrategy(req.session.token),
    code,
    frame.pending.getIdentities(req.session.token)
  );

  return res.redirect(
    `${frame.pending.getRedirectionTarget(req.session.token)}?code=${code}`
  );
});

router.post("/verify", (req, res) => {
  if (!req.body?.code) {
    return res.status(500).send("No code!");
  }

  // If there is a finalization action, call it,
  // otherwise, just send the finalization to the client.
  if (!frame.finished.exists(req.body.code)) {
    return res.status(500).send("This authorization data does not exist!");
  }

  let finished = frame.finished.getFinished(req.body?.code).wrap();

  return res.send(finished);
});
