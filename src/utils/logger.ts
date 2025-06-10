import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";

const logDir = `${process.cwd()}/logs`;

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: "YYYY-MM-DD-HH",
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
  };
};

const appName = "dataLoader";

export const Logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.label({ label: appName }),
    winston.format.printf(
      (info) =>
        `[${info.label}] ${info.timestamp} ${info.level} : ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.ms(),
        winston.format.json(),
        winston.format.colorize(),
        winston.format.printf(
          (info) =>
            `[${info.label}] ${info.timestamp} ${info.level} : ${info.message}`
        )
      ),
    }),

    new winstonDaily(dailyOptions("info")),
    new winstonDaily(dailyOptions("warn")),
    new winstonDaily(dailyOptions("error")),
  ],
});
