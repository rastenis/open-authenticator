import {
  IFinishedMap,
  entityError,
  authenticationModuleError,
} from "../interfaces";
import { FinishedItem } from "./finishedItem";

export class Finished {
  constructor() {}

  finished: IFinishedMap = {};

  addFinished = async (strategy: string, code: string, identityData: any) => {
    if (this.finished[code]) {
      console.log(
        "CRITICAL: Can not override existing finished authentication."
      );
      throw entityError.alreadyExists;
    }

    // adding finished
    this.finished[code] = new FinishedItem(strategy, code, identityData);
  };
}
