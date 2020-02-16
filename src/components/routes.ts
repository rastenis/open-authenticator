import { Router } from "express";

export let router = Router();

router.get("/", (req, res) => {
  res.send("OK");
});

router.get("/initiate", (req, res) => {
  console.log("Initiating authorization for ", req.query.identifier);

  // Keep connection open while authorizing
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache"
  };
  res.writeHead(200, headers);

  // send out verification notifications and wait for a response
  // TODO:

  const data = `data: test`;
  res.write(data);

  // Cleanup unfinished authorization on close
  req.on("close", () => {
    console.log(`Connection closed`);
  });

  res.sendStatus(200);
});

router.get("/authenticate/:token", (req, res) => {
  console.log("Confirming authorization for ", req.params.token);

  // TODO:
});
