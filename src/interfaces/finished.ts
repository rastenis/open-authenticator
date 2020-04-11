import { Response, Request } from "express";
import { IFinishedItem } from "../finished/finishedItem";

export interface IFinishedMap {
  [identifier: string]: IFinishedItem;
}
