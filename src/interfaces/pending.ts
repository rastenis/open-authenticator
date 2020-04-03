import { Response } from "express";

export interface IPending {
  strategy: string;
  token: string;
  date: Date;
  identifier: string;
  res: Response;
}
