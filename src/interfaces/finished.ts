import { Response, Request } from "express";
import { IFinishedItem } from "../finished/FinishedItem";

export interface IFinishedMap {
  [identifier: string]: IFinishedItem;
}
