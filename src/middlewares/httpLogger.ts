import morgan, { StreamOptions } from "morgan";

import Logger from "@utilities/Logger";

const stream: StreamOptions = {
  write: (message) => Logger.info(message),
};

// Build the morgan middleware
const morganMiddleware = morgan("combined", { stream: stream });

export default morganMiddleware;
