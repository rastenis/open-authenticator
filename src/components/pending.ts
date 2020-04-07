import {
  IPendingMap,
  pendingError,
  authenticationModuleError,
} from "../interfaces";
import * as uuid from "uuid";
import { Response, Request } from "express";
import { delay } from "./utils";

export class Pending {
  constructor() {}

  pending: IPendingMap = {};

  addPending = async (
    strategy: string,
    identity: string,
    redirect: string,
    token: string,
    req: Request,
    res: Response
  ) => {
    if (this.pending[token]) {
      console.log(
        "CRITICAL: Can not override existing pending authentication."
      );
      throw pendingError.alreadyExists;
    }

    // adding pending
    this.pending[token] = {
      strategy,
      date: new Date(),
      token,
      identity,
      finalized: false,
      redirect,
      req,
      res,
    };

    req.session.token = token;

    //   // sending verification request based on auth type
    //   if (!methods[method.type]) {
    //     console.log("Authentication method not yet supported.");
    //     throw pendingError.invalidMethod;
    //   }

    //   methods[method.type].notify(identifier, method);
  };

  attach = async (token: string, res: Response) => {
    if (!this.pending[token]) {
      console.log(
        "CRITICAL: Can not attach to non-existent pending authentication."
      );
      throw pendingError.nonexistant;
    }

    // adding pending
    this.pending[token].res = res;
  };

  cancel = async (token: string) => {
    if (!this.pending[token]) {
      console.log(
        "CRITICAL: Can not cancel non-existent pending authentication."
      );
      throw pendingError.nonexistant;
    }

    // grace period for redirections.
    await delay(10000);

    // deleting pending
    delete this.pending[token];
  };

  confirmPending = (token: string) => {
    if (!this.pending[token]) {
      throw pendingError.nonexistant;
    }
    if (this.pending[token].date.getTime() + 10 * 60 * 1000 < Date.now()) {
      throw pendingError.expired;
    }
    // confirming...
    this.pending[token].finalized = true;
    this.pending[token].date = new Date(Date.now() + 10 * 60 * 1000);
  };

  isFinalized = async (token: string) => {
    if (!this.pending[token]) {
      throw pendingError.nonexistant;
    }
    if (this.pending[token].date.getTime() + 10 * 60 * 1000 < Date.now()) {
      throw pendingError.expired;
    }

    return this.pending[token].finalized;
  };

  getRedirectionTarget = (token: string) => {
    return this.pending[token]?.redirect;
  };

  getStrategy = (token: string) => {
    return this.pending[token]?.strategy;
  };

  getPending = (token: string) => {
    return this.pending[token];
  };

  getRes = (token: string) => {
    return this.pending[token].res;
  };

  getToken = (): string => {
    let t = "";
    for (let index = 0; index < 2; index++) {
      t = this.splice(t, Math.random() * t.length, 0, uuid.v4());
    }
    return t;
  };

  splice = (s, start, delCount, newSubStr): string => {
    return s.slice(0, start) + newSubStr + s.slice(start + Math.abs(delCount));
  };
}
