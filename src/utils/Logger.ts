import * as winston from "winston";
import fs from "fs";
import path from "path";
import { LogType } from "../models/logs";
import envConfig from "../config/envConfig";

// Configure custom levels and colors
const customLevels: {
  levels: { [key in LogType]: number };
  colors: { [key in LogType]: string };
} = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 4,
    delete: 5,
    verbose: 6,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    verbose: "cyan",
    debug: "white",
    delete: "blue",
  },
};

winston.addColors(customLevels.colors);

// Format definition
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Ensure logs directory exists
const logsDir = "./server-logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Max file size from env (in MB), default to 10MB
const maxFileSizeBytes = (envConfig.LOG_MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const combinedTransport = new winston.transports.File({
  filename: path.join(logsDir, "combined.log"),
  level: LogType.verbose,
  maxsize: maxFileSizeBytes,
  maxFiles: 1,
});

// Cache for created loggers
const loggers: { [key in LogType]?: winston.Logger } = {};

const createLoggerByType = (logType: LogType): winston.Logger => {
  if (loggers[logType]) {
    return loggers[logType];
  }

  const consoleLogLevel: LogType = envConfig.CONSOLE_LOG_LEVEL;
  const filePath = path.join(logsDir, `${logType}.log`);

  const transports: winston.transport[] = [
    new winston.transports.File({
      filename: filePath,
      level: logType,
      maxsize: maxFileSizeBytes,
      maxFiles: 1,
    }),
    combinedTransport,
  ];

  // Add console transport only if this logType <= configured console level
  if (customLevels.levels[logType] <= customLevels.levels[consoleLogLevel]) {
    transports.unshift(
      new winston.transports.Console({
        level: logType,
        format: logFormat,
      })
    );
  }

  const logger = winston.createLogger({
    levels: customLevels.levels,
    level: logType,
    format: logFormat,
    transports,
  });

  loggers[logType] = logger;
  return logger;
};

// Expose Logger with easy-to-use API: Logger.info("msg"), etc.
const createLogger = (): {
  [key in LogType]: (msg: string | object) => void;
} => {
  const loggerObj = {} as { [key in LogType]: (msg: string | object) => void };

  for (const type in LogType) {
    if (isNaN(Number(type))) {
      const logType = LogType[type as keyof typeof LogType];

      loggerObj[logType] = (msg: string | object) => {
        const formattedMsg =
          typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        createLoggerByType(logType).log(logType, formattedMsg);
      };
    }
  }

  return loggerObj;
};

const Logger = createLogger();

export default Logger;
