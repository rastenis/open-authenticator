import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import config from "../config";

export default function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.strategies.google.key,
        clientSecret: config.strategies.google.secret,
        callbackURL: `${config.url}/managed/google`,
      },
      function (token, tokenSecret, profile, done) {
        return done(null, { identity: profile.id, data: profile });
      }
    )
  );
}
