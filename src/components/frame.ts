import { Pending } from "./pending";

export class Frame {
  constructor() {
    this.pending = new Pending();
  }

  pending: Pending;
}
