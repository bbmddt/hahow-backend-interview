import winston from 'winston';

const upperCaseLevelFormat = winston.format((info) => {
  info.level = info.level.toUpperCase();
  return info;
});

const logger = winston.createLogger({
  level: 'info', // default
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    upperCaseLevelFormat(),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.padEnd(7)}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
