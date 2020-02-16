import { IPending } from "../interfaces";
import * as uuid from "uuid";
import * as methods from "./methods";

let pending: { [identifier: string]: IPending };

export enum pendingError {
  nonexistant,
  expired,
  invalidMethod
}

export enum authenticationModuleError {
  missingConfiguration
}

export async function addPending(identifier: string, type: string) {
  if (pending[identifier]) {
    console.log("WARNING: Overwriting previous pending authentication.");
  }

  // adding pending
  pending[identifier] = {
    date: new Date(),
    token: getToken(),
    type,
    identifier
  };

  // sending verification request based on auth type
  if (!methods[type]) {
    console.log("Authentication method not yet supported.");
    throw pendingError.invalidMethod;
  }

  methods[type].notify(identifier, pending[identifier].token);
}

export async function confirmPending(identifier: string, token: string) {
  if (!pending[identifier]) {
    throw pendingError.nonexistant;
  }
  if (pending[identifier].date.getTime() + 10 * 60 * 1000 < Date.now()) {
    throw pendingError.expired;
  }
  // confirming...
  // TODO
}

function getToken(): string {
  const t = "";
  for (let index = 0; index < 5; index++) {
    splice(t, Math.random() * t.length, 0, uuid.v4());
  }

  return t;
}

function splice(s, start, delCount, newSubStr) {
  return s.slice(0, start) + newSubStr + s.slice(start + Math.abs(delCount));
}
