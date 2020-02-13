import { Router } from "express";

export let router = Router();

router.get("/", (req, res) => {
  res.send("OK");
});
