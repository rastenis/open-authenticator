import * as path from "path";
import config from "./config";

import { db } from "./components/db";
import * as express from "express";
import * as bodyparser from "body-parser";
import * as favicon from "serve-favicon";

import { router } from "./components/routes";

// app declaration
const app = express();
app.set("port", process.env.PORT || config.port);
app.disable("view cache");

app.use(favicon(path.join(__dirname, "../client/public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "../client/public")));
app.use("/up", express.static(path.join(__dirname, "../uploads")));
app.use(
  bodyparser.urlencoded({
    extended: true
  })
);
app.use(bodyparser.json());

// route setup
app.use("/", router);

//404 bounces
app.get("*", function(req, res) {
  res.render("404page", {});
});

// http listening (router handles https)
app.listen(config.port);

// delimiting logs
console.log(`Open Authenticator server running, PORT: ${app.get("port")}`);
console.log(`Open Authenticator server running, PORT: ${app.get("port")}`);
