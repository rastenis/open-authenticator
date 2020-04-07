import { Response, Request } from "express";
import { FinishedItem } from "../finished/finishedItem";

export interface IFinishedMap {
  [identifier: string]: FinishedItem;
}
