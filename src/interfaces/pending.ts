import { Response } from "express";

export interface IPending {
  strategy: string;
  token: string;
  date: Date;
  identity: string;
  res?: Response;
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
