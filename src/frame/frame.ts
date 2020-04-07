import { Pending } from "../pending/pending";

export class Frame {
  constructor() {
    this.pending = new Pending();
  }

  pending: Pending;
}
