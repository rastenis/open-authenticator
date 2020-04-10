var passport = require("passport");
import { OAuthStrategy as GoogleStrategy } from "passport-google-oauth";
import config from "../config";

passport.use(
  new GoogleStrategy(
    {
      consumerKey: config.strategies.google.key,
      consumerSecret: config.strategies.google.secret,
      callbackURL: `${config.url}/managed/google`,
    },
    function (token, tokenSecret, profile, done) {
      return done(null, { identity: profile.id, data: profile });
    }
  )
);
