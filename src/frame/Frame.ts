import { Pending } from "../pending/pending";
import { Finished } from "../finished/Finished";
import config from "../config";
import * as strategies from "../strategies";
import to from "await-to-js";
import * as crs from "crypto-random-string";
import { Request, Response } from "express";
import * as passport from "passport";

export class Frame {
  constructor() {
    this.pending = new Pending();
    this.finished = new Finished();
  }

  pending: Pending;
  finished: Finished;
  managedStrategies: [string] = config.managed;

  /**
   * Method to initiate authentication flow.
   *
   * @param {string} client_id      - Requester's client id
   * @param {string} redirect_uri   - The desired redirect url
   * @param {boolean} insecure      - True when accessing locally (via http)
   * @param {string} strategy       - (Optional) Name of strategy to use. If not supplied, user is allowed to authenticate any of the enabled strategies.
   * @param {string} identity       - (Optional) Identity that needs to be verified. If not supplied, user will be limited to login strategy provided. If no strategy was sent in, the user can login via any available strategy.
   * @param {boolean} strict        - Default:true. Disallow strategy choice and force to log in via the provided strategy.
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  initiate = async (
    client_id: string,
    redirect_uri: string,
    insecure: boolean,
    strategy: string,
    identity: string,
    strict: boolean,
    req: Request,
    res: Response,
    next: any
  ) => {
    console.log(
      `Initiating authorization for ${identity ?? "new user"} through ${
        strategy ?? "any strategy."
      } ${strict == true ? "(strict)" : ""}`
    );

    // Checking client_id
    if (!config.clients?.includes(client_id)) {
      return res.status(500).send("Unregistered client_id!");
    }

    // Checking for conflicting parameters
    // (strategy && !identity) is allowed, because some strategies do not require identities prior.
    if (identity && !strategy) {
      return res.status(500).send("Cannot verify identity without a strategy!");
    }

    if (!redirect_uri) {
      return res.status(500).send("No redirect uri provided!");
    }

    // Managed PassportJS strategies
    if (this.managedStrategies.includes(strategy)) {
      // attaching redirection url to session

      console.log(`Using managed strategy... (${strategy})`);

      req.session.redirect_uri = redirect_uri;
      passport.authenticate(
        strategy,
        config.strategies[strategy]?.params ?? {}
      )(req, res, next);
      return;
    }

    // Checking user
    if (!identity) {
      // rendering menu for all strategies that do not require an identity.
      return res.render("menu", {
        strategies: config.managed
          .concat(
            config.showCustomStrategiesInAnyAuthMenu // Add custom strategies to the menu, if that is enabled in the config
              ? Object.keys(strategies).filter(
                  (s) => strategies[s].requiresIdentity === false
                )
              : []
          )
          .map((strategyName) => {
            return {
              name: strategyName,
              path: `/initiate?client_id=${client_id}&strategy=${strategyName}&redirect_uri=${redirect_uri}`,
            };
          }),
      });
    }

    // Identity is present, so must be a valid strategy.
    if (!strategies[strategy]) {
      return res.status(500).send("Invalid strategy!");
    }

    // generating token
    req.session.token = crs({ length: 30 });

    // directing to strategy
    let [strategyInitiationError] = await to(
      strategies[strategy].initiate(
        req.session.token,
        config.strategies[strategy],
        identity,
        req,
        res
      )
    );

    if (strategyInitiationError) {
      return res.status(500).send(strategyInitiationError.message);
    }

    // adding a pending authentication
    let [addPendingError] = await to(
      this.pending.addPending(
        strategy,
        identity,
        redirect_uri,
        req.session.token,
        req,
        res
      )
    );

    if (addPendingError) {
      return res.status(500).send(addPendingError.message);
    }

    // TODO: allow custom pages
    return res.render(strategies[strategy].view ?? "default", {
      strategy: strategy,
      identity: identity,
      timeout: strategies[strategy].timeout,
    });
  };

  finalizeManagedProxy = (req, res, next) => {
    passport.authenticate(req.params.strategy)(req, res, next);
  };

  finalizeManaged(req, res) {
    // Strategy did not handle the identity data, so we only add the identifier as data.

    let code = crs({ length: 20, type: "numeric" });

    this.finished.addFinished(
      "",
      code,
      req.params?.strategy,
      req.user?.identity,
      req.user?.data
    );

    // WARNING: Sessions do not work consistently in non https, even with secure:false, apparently.
    if (!req.session.redirect_uri) {
      console.error(
        "redirect_uri was not attached to session! Can not complete authentication!"
      );
    }

    res.redirect(`${req.session.redirect_uri}?code=${code}`);
  }
}
