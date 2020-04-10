import { Response, Request } from "express";
import { IPendingItem } from "../pending/pendingItem";

export interface IPendingMap {
  [identifier: string]: IPendingItem;
}
