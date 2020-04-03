import { IPending } from "../interfaces";
import * as uuid from "uuid";
import * as methods from "./strategies";
import config from "../config";
import { Response } from "express";

let pending: { [identifier: string]: IPending };

export enum pendingError {
  nonexistant,
  expired,
  invalidMethod
}

export enum authenticationModuleError {
  missingConfiguration
}

export async function addPending(
  strategy: string,
  identifier: string,
  res: Response
) {
  if (pending[identifier]) {
    console.log("WARNING: Overwriting previous pending authentication.");
  }

  // adding pending
  pending[identifier] = {
    strategy,
    date: new Date(),
    token: getToken(),
    identifier,
    res
  };

  //   // sending verification request based on auth type
  //   if (!methods[method.type]) {
  //     console.log("Authentication method not yet supported.");
  //     throw pendingError.invalidMethod;
  //   }

  //   methods[method.type].notify(identifier, method);
}

export async function confirmPending(identifier: string, token: string) {
  if (!pending[identifier]) {
    throw pendingError.nonexistant;
  }
  if (pending[identifier].date.getTime() + 10 * 60 * 1000 < Date.now()) {
    throw pendingError.expired;
  }
  // confirming...
  pending[identifier].res.write("data: confirmed");
}

export function getToken(): string {
  const t = "";
  for (let index = 0; index < 5; index++) {
    splice(t, Math.random() * t.length, 0, uuid.v4());
  }

  return t;
}

function splice(s, start, delCount, newSubStr) {
  return s.slice(0, start) + newSubStr + s.slice(start + Math.abs(delCount));
}
