import { Response, Request } from "express";
import { PendingItem } from "../pending/pendingItem";

export interface IPendingMap {
  [identifier: string]: PendingItem;
}

export enum pendingError {
  nonexistant,
  expired,
  invalidMethod,
  alreadyExists,
}

export enum authenticationModuleError {
  missingConfiguration,
}
