import { Response, Request } from "express";
import * as moment from "moment";
import { IIdentities } from "../interfaces";

export class FinishedItem {
  private _strategy: string;
  private _code: string;
  private _expiry: moment.Moment;
  private _identities: IIdentities;

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

  public get identityData(): IIdentities {
    return this._identities;
  }
  public set identityData(value: IIdentities) {
    this._identities = value;
  }

  public get code(): string {
    return this._code;
  }
  public set code(value: string) {
    this._code = value;
  }

  /**
   * Creates an instance of FinishedItem.
   * @param {string} strategy
   * @param {string} code
   * @param {IIdentities} identityData
   * @memberof FinishedItem
   */
  constructor(strategy: string, code: string, identityData: IIdentities) {
    this._strategy = strategy;
    this._identities = identityData;
    this._expiry = moment().add(10, "minutes");
    this._code = code;
  }

  /**
   * A method to retrieve a servable representation of a finishedItem object
   *
   * @memberof FinishedItem
   */
  wrap = () => {
    return {
      strategy: this._strategy,
      identities: this._identities,
    };
  };
}
