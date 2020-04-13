import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import config from "../config";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as GithubStrategy } from "passport-github2";

export default function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  //  TO ADD NEW STRATEGY:
  //   passport.use(
  //     new SomeNewStrategy(
  //       {
  //         consumerKey: config.strategies.platform.key,
  //         consumerSecret: config.strategies.platform.secret,
  //         callbackURL: `${config.url}/managed/platform`,
  //       },
  //       function (token, tokenSecret, profile, done) {
  //         return done(null, { identity: profile.id, data: profile });
  //       }
  //     )
  //   );

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

  passport.use(
    new TwitterStrategy(
      {
        consumerKey: config.strategies.twitter.key,
        consumerSecret: config.strategies.twitter.secret,
        callbackURL: `${config.url}/managed/twitter`,
      },
      function (token, tokenSecret, profile, done) {
        return done(null, { identity: profile.id, data: profile });
      }
    )
  );

  passport.use(
    new GithubStrategy(
      {
        clientID: config.strategies.github.key,
        clientSecret: config.strategies.github.secret,
        callbackURL: `${config.url}/managed/github`,
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, { identity: profile.id, data: profile });
      }
    )
  );
}
