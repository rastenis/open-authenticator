import { Response, Request } from "express";

export interface IPending {
  strategy: string;
  token: string;
  date: Date;
  identity: string;
  finalized: boolean;
  redirect: string;
  req?: Request;
  res?: Response;
}

export interface IPendingMap {
  [identifier: string]: IPending;
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
