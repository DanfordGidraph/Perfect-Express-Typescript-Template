import express, { NextFunction } from "express";
import Logger from "@utilities/Logger";

export class ErrorHandler extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const clientErrorHandler = (err: ErrorHandler, req: express.Request, res: express.Response, next: NextFunction): void => {
  if (req.xhr) {
    const { statusCode, message } = err;
    res.status(500).send({ status: "error", statusCode, message, })
  } else {
    next(err)
  }
}


export const errorLogger = (err: ErrorHandler, req: express.Request, res: express.Response, next: NextFunction): void => {
  Logger.error("Error: ", err.stack);
  next();
}


export const handleError = (err: ErrorHandler, req: express.Request, res: express.Response, next: NextFunction): void => {
  res.status(err.statusCode)
  res.render("error", { error: err })
};
