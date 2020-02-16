import { IPending } from "../interfaces";
import * as uuid from "uuid";

let pending: { [identifier: string]: IPending };

enum pendingError {
  nonexistant,
  expired
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
  // TODO
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
