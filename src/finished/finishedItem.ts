import { Response, Request } from "express";
import * as moment from "moment";

export class FinishedItem {
  private _strategy: string;
  private _code: string;
  private _expiry: moment.Moment;
  private _identityData: string;

  public get expiry(): moment.Moment {
    return this._expiry;
  }
  public set expiry(value: moment.Moment) {
    this._expiry = value;
  }

  public get strategy(): string {
    return this._strategy;
  }
  public set strategy(value: string) {
    this._strategy = value;
  }

  public get identityData(): string {
    return this._identityData;
  }
  public set identityData(value: string) {
    this._identityData = value;
  }

  public get code(): string {
    return this._code;
  }
  public set code(value: string) {
    this._code = value;
  }

  constructor(strategy: string, code: string, identityData: string) {
    this._strategy = strategy;
    this._identityData = identityData;
    this._expiry = moment().add(10, "minutes");
    this._code = code;
  }
}
