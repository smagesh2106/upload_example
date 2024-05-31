const winston = require("winston");
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: "info", // Set your desired logging level (e.g., 'info', 'error', 'debug')
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ filename: process.env.AUDIT_LOG_FILE }), // Log to a file
  ],
});

module.exports = logger;
