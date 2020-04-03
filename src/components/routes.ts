import { Router } from "express";
import * as pending from "./pending";
import * as strategies from "./strategies";
import config from "../config";

export let router = Router();

router.get("/", (req, res) => {
  res.send("OK");
});

// client_id:string         - The requesting client id.
// strategy:string          - Name of strategy
// insecure:bool            - true when accessing locally (via http)
// identity:string          - (Optional) Identity that needs to be verified.
// identity_strict:bool     - Default:true
router.get("/initiate", (req, res) => {
  console.log(
    `Initiating authorization for ${req.query.identity ??
      "new user"} through ${req.query.strategy ?? "any strategy."}`
  );

  // TODO: check client_id

  // Checking user
  if (req.query.identity && !config.users[req.query.identity]) {
    return res.status(500).send("Invalid user!");
  }

  // directing to strategy
  if (strategies[req.query.strategy]) {
    strategies[req.query.strategy].initiate(
      config.strategies[req.query.strategy],
      config.users[req.query.identity]?.data[req.query.identity],
      req,
      res,
      pending
    );
  } else {
    return res.status(500).send("Invalid strategy!");
  }

  // LEFTOFF: Send custom or default page:

  // Keep connection open while authorizing
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache"
  };
  res.writeHead(200, headers);

  // Cleanup unfinished authorization on close
  req.on("close", () => {
    console.log(`Connection closed`);
  });
});

router.get("/finalize/:token", (req, res) => {
  console.log("Confirming authorization for ", req.params.token);

  pending.confirmPending(req.query.identifier, req.query.token);

  res.sendStatus(200);
});
