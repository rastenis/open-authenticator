import * as path from "path";
import config from "./config";
import * as express from "express";
import * as bodyparser from "body-parser";
import * as session from "express-session";
import * as helmet from "helmet";
import { router } from "./routes";
import { Frame } from "./frame/frame";
import * as passport from "passport";
import manualConfiguration from "./configs/manual";

// Importing managed config
let managedConfiguration;
try {
  managedConfiguration = require("../config/managed.js");
} catch (e) {
  console.error(
    "Managed configuration is not present in the config/ folder! Have you run the setup?",
    e
  );
  process.exit(1);
}

// App declaration
const app = express();
app.set("port", process.env.PORT || config.port || 3000);
app.disable("view cache");
app.use(express.static("client"));

// Important when running Nginx + Https and having config.sessionSecure = true
app.set("trust proxy", 1);

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      secure: config.sessionSecure ?? true,
    },
  })
);
app.use(helmet());

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(bodyparser.json());

// Setting up configurations
manualConfiguration(passport);
managedConfiguration(passport);

app.use(passport.initialize());
app.use(passport.session());
app.set("views", path.join(__dirname, "../client/views"));
app.set("view engine", "pug");

// route setup
app.use("/", router);

//404 bounces
app.get("*", function (req, res) {
  res.render("404page", {});
});

// Initiating frame
export const frame = new Frame();

// http listening (router handles https)
app.listen(config.port);

console.log(`Open Authenticator server running, PORT: ${app.get("port")}`);
