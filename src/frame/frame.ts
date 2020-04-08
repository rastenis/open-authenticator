import { Pending } from "../pending/pending";
import { Finished } from "../finished/finished";
import config from "../config";
import * as strategies from "../strategies";
import to from "await-to-js";
import { Request, Response } from "express";

export class Frame {
  constructor() {
    this.pending = new Pending();
    this.finished = new Finished();
  }

  pending: Pending;
  finished: Finished;

  /**
   * Method to initiate authentication flow.
   *
   * @param {string} client_id
   * @param {string} redirect_uri
   * @param {boolean} insecure
   * @param {string} strategy
   * @param {string} identity
   * @param {string} identities
   * @param {boolean} strict
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
    identities: string,
    strict: boolean,
    req: Request,
    res: Response
  ) => {
    console.log(
      `Initiating authorization for ${identity ?? "new user"} through ${
        strategy ?? "any strategy."
      } ${strict == true ? "(strict)" : ""}`
    );

    // Checking client_id
    if (!config.client_ids?.includes(client_id)) {
      return res.status(500).send("Unregistered client_id!");
    }

    // Checking user
    // TODO: any-identity logins
    if (!identity) {
      return res.status(500).send("No identity supplied!");
    }

    if (!redirect_uri) {
      return res.status(500).send("No redirect uri provided!");
    }

    // generating token
    req.session.token = this.pending.getToken();

    if (!strategies[strategy]) {
      return res.status(500).send("Invalid strategy!");
    }

    // TODO: Check for conflicting parameters

    // Resolving identities
    let parsedIdentities = {};
    if (identities) {
      try {
        parsedIdentities = JSON.parse(identities);
      } catch {}
    }

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
      return res.status(500).send(strategyInitiationError);
    }

    // adding a pending authentication
    this.pending.addPending(
      strategy,
      identity,
      parsedIdentities,
      redirect_uri,
      req.session.token,
      req,
      res
    );

    // TODO: allow custom pages
    return res.render("default", { strategy: strategy });
  };
}
