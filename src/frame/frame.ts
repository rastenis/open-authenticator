import { Pending } from "../pending/pending";
import { Finished } from "../finished/finished";

export class Frame {
  constructor() {
    this.pending = new Pending();
    this.finished = new Finished();
  }

  pending: Pending;
  finished: Finished;
}
