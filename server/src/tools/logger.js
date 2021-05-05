const winston = require('winston');

const { createLogger, format, transports } = winston;

const maxsize = 10 * 1000 * 1000; // 10MB

const errorStackFormat = winston.format(info => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
      message: info.message,
    };
  }
  return info;
});

const myFormatConsole = format.printf((item) => {
  const {
    level, message, timestamp, stack,
  } = item;
  let log = `${timestamp} [${level}]: ${message}`;
  if (stack) log += `\n${stack}`;
  return log;
});

// eslint-disable-next-line no-control-regex
const colorRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const noColorFormat = format((info) => {
  if (info && info.message && typeof info.message === 'string') info.message = info.message.replace(colorRegex, '');
  return info;
});


const tmp = [format.splat(), format.timestamp()];
if (process.env.STAGE !== 'development') tmp.push(noColorFormat());
else tmp.push(format.colorize());

const consoleFormat = format.combine(format.splat(),
  ...tmp, format.prettyPrint(), myFormatConsole);

const fileFormat = format.combine(
  errorStackFormat(), format.splat(), format.timestamp(), format.prettyPrint(),
);

const transp = [
  new transports.File({
    filename: 'debug.log', level: 'debug', maxsize,
  }),
  new transports.File({
    filename: 'console.log', format: consoleFormat, level: 'debug', maxsize,
  }),
  new transports.File({
    filename: 'error.log', level: 'error', maxsize,
  }),
];
if (!process.env.TEST) transp.push(new transports.Console({ format: consoleFormat, level: 'silly' }));


// eslint-disable-next-line new-cap
const logger = createLogger({
  format: fileFormat,
  transports: transp,
});

logger.stream = {
  write: (msg) => {
    logger.info(msg);
  },
};

module.exports = logger;
