import { Response } from "express";

export interface IPending {
  token: string;
  date: Date;
  type: string;
  identifier: string;
  res: Response;
}
