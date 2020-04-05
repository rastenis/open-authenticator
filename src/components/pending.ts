import {
  IPending,
  pendingError,
  authenticationModuleError,
} from "../interfaces";
import * as uuid from "uuid";
import { Response } from "express";

let pending: { [identifier: string]: IPending } = {};

export async function addPending(
  strategy: string,
  identity: string,
  token: string
) {
  if (pending[token]) {
    console.log("CRITICAL: Can not override existing pending authentication.");
    throw pendingError.alreadyExists;
  }

  // adding pending
  pending[token] = {
    strategy,
    date: new Date(),
    token: getToken(),
    identity,
  };

  //   // sending verification request based on auth type
  //   if (!methods[method.type]) {
  //     console.log("Authentication method not yet supported.");
  //     throw pendingError.invalidMethod;
  //   }

  //   methods[method.type].notify(identifier, method);
}

export async function attach(token: string, res: Response) {
  if (!pending[token]) {
    console.log(
      "CRITICAL: Can not attach to non-existent pending authentication."
    );
    throw pendingError.nonexistant;
  }

  // adding pending
  pending[token].res = res;
}

export async function cancel(token: string) {
  if (!pending[token]) {
    console.log(
      "CRITICAL: Can not cancel non-existent pending authentication."
    );
    throw pendingError.nonexistant;
  }

  // deleting pending
  delete pending[token];
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
