import {
  IPendingMap,
  entityError,
  authenticationModuleError,
} from "../interfaces";
import * as uuid from "uuid";
import { Response, Request } from "express";
import { delay } from "../helpers/utils";
import { PendingItem } from "./pendingItem";

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
      throw entityError.alreadyExists;
    }

    // adding pending
    this.pending[token] = new PendingItem(
      strategy,
      identity,
      redirect,
      token,
      req
    );

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
      throw entityError.nonexistent;
    }

    // adding pending
    this.pending[token].res = res;
  };

  cancel = async (token: string) => {
    if (!this.pending[token]) {
      console.log(
        "CRITICAL: Can not cancel non-existent pending authentication."
      );
      throw entityError.nonexistent;
    }

    // grace period for redirections.
    await delay(10000);

    // deleting pending
    delete this.pending[token];
  };

  confirmPending = (token: string) => {
    if (!this.pending[token]) {
      throw entityError.nonexistent;
    }
    if (this.pending[token].date.getTime() + 10 * 60 * 1000 < Date.now()) {
      throw entityError.expired;
    }
    // confirming...
    this.pending[token].finalized = true;
    this.pending[token].date = new Date(Date.now() + 10 * 60 * 1000);
  };

  isFinalized = async (token: string) => {
    if (!this.pending[token]) {
      throw entityError.nonexistent;
    }
    if (this.pending[token].date.getTime() + 10 * 60 * 1000 < Date.now()) {
      throw entityError.expired;
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

  getIdentityData = (token: string) => {
    if (!this.pending[token]) {
      throw entityError.nonexistent;
    }

    return this.pending[token].identity;
  };

  splice = (s, start, delCount, newSubStr): string => {
    return s.slice(0, start) + newSubStr + s.slice(start + Math.abs(delCount));
  };
}
