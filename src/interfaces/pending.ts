import { Response, Request } from "express";
import { PendingItem } from "../pending/pendingItem";

export interface IPendingMap {
  [identifier: string]: PendingItem;
}
