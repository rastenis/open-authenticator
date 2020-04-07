import { Response, Request } from "express";
import { IIdentities } from "../interfaces";

export class PendingItem {
  private _strategy: string;
  private _token: string;
  private _date: Date;
  private _identity: string;
  private _identities: IIdentities;
  private _finalized: boolean;
  private _redirect: string;
  private _req?: Request;
  private _res?: Response;

  public get strategy(): string {
    return this._strategy;
  }
  public set strategy(value: string) {
    this._strategy = value;
  }
  public get token(): string {
    return this._token;
  }
  public set token(value: string) {
    this._token = value;
  }
  public get date(): Date {
    return this._date;
  }
  public set date(value: Date) {
    this._date = value;
  }
  public get identity(): string {
    return this._identity;
  }
  public set identity(value: string) {
    this._identity = value;
  }
  public get finalized(): boolean {
    return this._finalized;
  }
  public set finalized(value: boolean) {
    this._finalized = value;
  }
  public get redirect(): string {
    return this._redirect;
  }
  public set redirect(value: string) {
    this._redirect = value;
  }
  public get req(): Request {
    return this._req;
  }
  public set req(value: Request) {
    this._req = value;
  }
  public get res(): Response {
    return this._res;
  }
  public set res(value: Response) {
    this._res = value;
  }
  public get identities(): IIdentities {
    return this._identities;
  }
  public set identities(value: IIdentities) {
    this._identities = value;
  }

  constructor(
    strategy: string,
    identity: string,
    identities: IIdentities,
    redirect: string,
    token: string,
    req: Request
  ) {
    this._identity = identity;
    this._identities = identities;
    this._strategy = strategy;
    this._redirect = redirect;
    this._token = token;
    this._req = req;
    this._finalized = false;
    this._date = new Date();

    // attaching token
    this.attachToken(token);
  }

  attachToken = (token) => {
    // Attaching the token to the initial requester's session
    this._req.session.token = token;
  };
}
