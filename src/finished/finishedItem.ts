import { Response, Request } from "express";
import * as moment from "moment";

export class IFinishedItem {
  private _strategy: string;
  private _token: string;
  private _identity: any;
  private _data: any;
  private _code: string;
  private _expiry: moment.Moment;

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

  public get code(): string {
    return this._code;
  }
  public set code(value: string) {
    this._code = value;
  }

  public get token(): string {
    return this._token;
  }
  public set token(value: string) {
    this._token = value;
  }

  public get identity(): any {
    return this._identity;
  }
  public set identity(value: any) {
    this._identity = value;
  }

  public get data(): any {
    return this._data;
  }
  public set data(value: any) {
    this._data = value;
  }

  /**
   *Creates an instance of FinishedItem.
   * @param {string} token
   * @param {string} code
   * @param {string} strategy
   * @param {string} identity
   * @param {string} data
   * @memberof IFinished
   */
  constructor(
    token: string,
    code: string,
    strategy: string,
    identity: string,
    data: string
  ) {
    this._strategy = strategy;
    this._expiry = moment().add(10, "minutes");
    this._code = code;
    this._token = token;
    this._identity = identity;
    this._data = data;
  }

  /**
   * A method to retrieve a servable representation of a finishedItem object
   *
   * @memberof IFinished
   */
  wrap = () => {
    return {
      strategy: this._strategy,
      identity: this._identity,
      data: this._data,
    };
  };
}
