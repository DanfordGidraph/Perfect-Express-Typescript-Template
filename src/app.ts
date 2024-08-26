import 'dotenv/config'
import 'module-alias/register';

import http from "http";
import path from "path";
import express from "express";
import favicon from 'express-favicon';
import cookieParser from "cookie-parser";

import router from "./routes/index";
import httpLogger from "./middlewares/httpLogger";
import { clientErrorHandler, errorLogger, handleError } from "./middlewares/error";

const __dirname = import.meta.dirname;
const app: express.Application = express();

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(path.resolve(__dirname + '/assets/images/favicon.ico')))
app.use("/", router);
app.use(errorLogger);
app.use(clientErrorHandler)
app.use(handleError)

const port = process.env.PORT || "8080";
app.set("port", port);

const server = http.createServer(app);

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      process.exit(1);
    case "EADDRINUSE":
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  console.info(`Server is listening on ${bind}`);
}

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
