import {
  IPendingMap,
  entityError,
  authenticationModuleError,
} from "../interfaces";
import { Response, Request } from "express";
import { delay } from "../helpers/utils";
import { IPendingItem } from "./pendingItem";

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
      throw new Error("Can not override existing pending authentication.");
    }

    // adding pending
    this.pending[token] = new IPendingItem(
      strategy,
      identity,
      redirect,
      token,
      req
    );
  };

  attach = async (token: string, res: Response) => {
    if (!this.pending[token]) {
      console.log(
        "CRITICAL: Can not attach to non-existent pending authentication."
      );
      throw new Error("Can not attach to non-existent pending authentication.");
    }

    // adding pending
    this.pending[token].res = res;
  };

  cancel = async (token: string) => {
    if (!this.pending[token]) {
      throw new Error("Can not cancel non-existent pending authentication.");
    }

    // grace period for redirections.
    await delay(10000);

    // deleting pending
    delete this.pending[token];
  };

  confirmPending = (token: string) => {
    if (!this.pending[token]) {
      throw new Error("Can not confirm non-existent pending authentication.");
    }
    if (this.pending[token].date.getTime() + 10 * 60 * 1000 < Date.now()) {
      throw new Error("This pending authentication has expired.");
    }
    // confirming...
    this.pending[token].finalized = true;
    this.pending[token].date = new Date(Date.now() + 10 * 60 * 1000);
  };

  isFinalized = async (token: string) => {
    if (!this.pending[token]) {
      throw new Error("Can not check non-existent pending authentication.");
    }
    if (this.pending[token].date.getTime() + 10 * 60 * 1000 < Date.now()) {
      throw new Error("This pending authentication has expired.");
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

  getReq = (token: string) => {
    return this.pending[token].req;
  };

  splice = (s, start, delCount, newSubStr): string => {
    return s.slice(0, start) + newSubStr + s.slice(start + Math.abs(delCount));
  };

  remove = async (token: string) => {
    if (!this.pending[token]) {
      console.log(
        "CRITICAL: Can not delete non-existent pending authentication."
      );
      throw new Error("Can not delete non-existent pending authentication.");
    }

    // removing pending
    delete this.pending[token];
  };
}
