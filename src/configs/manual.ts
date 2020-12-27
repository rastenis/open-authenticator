import { config } from "../config";

export default function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  //  TO ADD NEW STRATEGIES:
  //  yarn run strategies

  //  TO ADD NEW STRATEGY MANUALLY:
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
}
