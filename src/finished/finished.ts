import {
  IFinishedMap,
  entityError,
  authenticationModuleError,
} from "../interfaces";
import { FinishedItem } from "./finishedItem";

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
    this.finished[code] = new FinishedItem(
      token,
      code,
      strategy,
      identity,
      data
    );
  };

  exists = (code: string) => {
    return code && this.finished[code];
  };

  getFinished = (code: string) => {
    return this.finished[code];
  };
}
