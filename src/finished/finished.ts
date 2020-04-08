import {
  IFinishedMap,
  entityError,
  authenticationModuleError,
  IIdentities,
} from "../interfaces";
import { FinishedItem } from "./finishedItem";

export class Finished {
  constructor() {}

  finished: IFinishedMap = {};

  addFinished = async (
    strategy: string,
    code: string,
    identityData: IIdentities
  ) => {
    if (this.finished[code]) {
      console.log(
        "CRITICAL: Can not override existing finished authentication."
      );
      throw entityError.alreadyExists;
    }

    // adding finished
    this.finished[code] = new FinishedItem(strategy, code, identityData);
  };

  exists = (code: string) => {
    return code && this.finished[code];
  };

  getFinished = (code: string) => {
    return this.finished[code];
  };
}
