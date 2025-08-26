import "dotenv/config";
import { LogType } from "../models/logs";

const getEnvVariable = <T = string>(key: string, defaultValue?: T): T => {
  if (process.env[key] !== undefined) {
    return process.env[key] as unknown as T;
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`Missing required environment variable: ${key}`);
  }
};

const getBooleanEnvVariable = (
  key: string,
  defaultValue?: boolean
): boolean => {
  if (process.env[key] !== undefined) {
    return process.env[key]!.toLowerCase() === "true";
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`Missing required environment variable: ${key}`);
  }
};

const getIntEnvVariable = (key: string, defaultValue?: number): number => {
  if (process.env[key] !== undefined) {
    return parseInt(process.env[key]!, 10);
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`Missing required environment variable: ${key}`);
  }
};

let envConfig: {
  NODE_ENV: string;
  IS_PRINT_ENV: boolean;
  CONSOLE_LOG_LEVEL: LogType;
  REPO_NAME_PREFIX: string;

  MAIN_INSTANCE_URL: string;
  MAIN_INSTANCE_USERNAME: string;
  MAIN_INSTANCE_PASSWORD: string;

  TARGET_INSTANCES: string;

  SYNC_INTERVAL_SECONDS: number;
  LOG_MAX_FILE_SIZE_MB: number;
} = {
  NODE_ENV: "development",
  IS_PRINT_ENV: false,
  CONSOLE_LOG_LEVEL: LogType.verbose,
  REPO_NAME_PREFIX: "remote-",

  MAIN_INSTANCE_URL: "",
  MAIN_INSTANCE_USERNAME: "",
  MAIN_INSTANCE_PASSWORD: "",

  TARGET_INSTANCES: "",

  SYNC_INTERVAL_SECONDS: 300,
  LOG_MAX_FILE_SIZE_MB: 10,
};

try {
  envConfig = {
    NODE_ENV: getEnvVariable("NODE_ENV", "development"),
    IS_PRINT_ENV: getBooleanEnvVariable("IS_PRINT_ENV", false),
    CONSOLE_LOG_LEVEL: getEnvVariable<LogType>(
      "CONSOLE_LOG_LEVEL",
      LogType.verbose
    ),
    REPO_NAME_PREFIX: getEnvVariable("REPO_NAME_PREFIX", "remote-"),

    MAIN_INSTANCE_URL: getEnvVariable("MAIN_INSTANCE_URL"),
    MAIN_INSTANCE_USERNAME: getEnvVariable("MAIN_INSTANCE_USERNAME"),
    MAIN_INSTANCE_PASSWORD: getEnvVariable("MAIN_INSTANCE_PASSWORD"),

    TARGET_INSTANCES: getEnvVariable("TARGET_INSTANCES"),

    SYNC_INTERVAL_SECONDS: getIntEnvVariable("SYNC_INTERVAL_SECONDS", 300),
    LOG_MAX_FILE_SIZE_MB: getIntEnvVariable("LOG_MAX_FILE_SIZE_MB", 10),
  };

  if (envConfig.IS_PRINT_ENV) {
    console.log(envConfig);
  }
} catch (error) {
  console.log(`Error loading environment variables: ${error}, exiting...`);
  process.exit(1);
}

export default envConfig;
