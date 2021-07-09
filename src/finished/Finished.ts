import { IFinishedMap } from "../interfaces";
import { IFinishedItem } from "./FinishedItem";
import * as moment from "moment";

export class Finished {
  constructor() {}

  finished: IFinishedMap = {};

  /**
   * A method to register a finished authorization
   *
   * @param {string} token
   * @param {string} code
   * @param {string} strategy
   * @param {*} identity
   * @param {*} data
   */
  addFinished = async (
    token: string,
    code: string,
    strategy: string,
    identity: any,
    data: any
  ) => {
    if (this.finished[code]) {
      console.log(
        "CRITICAL: Can not override existing finished authentication."
      );

      throw new Error("Can not override existing finished authentication.");
    }

    // adding finished
    this.finished[code] = new IFinishedItem(
      token,
      code,
      strategy,
      identity,
      data
    );
  };

  /**
   * Function to check whether a finishedItem exists.
   *
   * @param {string} code  - Verification code
   * @returns {boolean}
   */
  exists = (code: string): boolean => {
    if (code && this.finished[code]) {
      this.checkPurge(this.finished[code]);
    }
    return !!this.finished[code];
  };

  getFinished = (code: string) => {
    return this.finished[code];
  };

  /**
   * Function to get a finishedItem by token and remove expires ones along the way.
   *
   * @param {string} token
   * @returns
   */
  getByToken = (token: string) => {
    return (
      token &&
      Object.values(this.finished).find((f) => {
        // checking expirations along the way
        this.checkPurge(f);
        return f.token === token;
      })
    );
  };

  checkPurge = (finished: IFinishedItem) => {
    if (moment().isAfter(finished.expiry)) {
      delete this.finished[finished.code];
    }
  };
}
