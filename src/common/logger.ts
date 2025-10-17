import * as emoji from 'node-emoji';
import * as winston from 'winston';
import chalk from 'chalk';
import { LoggerService } from '@nestjs/common';
import DailyRotateFile from 'winston-daily-rotate-file';

type CustomLogLevels =
  | 'crit'
  | 'error'
  | 'warn'
  | 'debug'
  | 'verbose'
  | 'success'
  | 'info';

const customLevels = {
  levels: {
    crit: 0,
    error: 1,
    warn: 2,
    debug: 3,
    verbose: 4,
    success: 5,
    info: 6,
  },
  colors: {
    crit: 'italic bold magentaBG',
    error: 'italic bold redBG',
    warn: 'italic yellow',
    debug: 'italic blue',
    verbose: 'dim italic cyan',
    success: 'italic green',
    info: 'italic grey',
  },
};

winston.addColors(customLevels.colors);

function sanitize(message: string): string {
  // Example: Remove any tokens or sensitive info via regex
  return message.replace(/(token=)[^& ]+/gi, '$1***');
}

const emojiMap: Record<CustomLogLevels, string> = {
  crit: emoji.get('skull'),
  error: emoji.get('x'),
  warn: emoji.get('rotating_light'),
  debug: emoji.get('bug'),
  verbose: emoji.get('eye') + ' ',
  success: emoji.get('white_check_mark'),
  info: emoji.get('information_source') + ' ',
};

const myFormat = winston.format.printf(
  ({ level, message, timestamp, context = '', stack, ...meta }) => {
    const plainLevel = level.replace(/\x1B\[[0-9;]*m/g, ''); // Remove color codes for comparison
    const emojiToLog =
      emojiMap[plainLevel as CustomLogLevels] ?? emoji.get('grey_question');

    const timeString = new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    let logMsg =
      `${chalk.green('[Winston]')} - ${timeString} ${chalk.green('LOG')} ` +
      `${chalk.yellow(`[${context}]`)} ${emojiToLog} [${level}]: ${sanitize(message)}`;

    if (stack) logMsg += `\n${chalk.red(stack)}`;

    // Include extra metadata if present
    if (Object.keys(meta).length > 0) {
      logMsg += ` ${chalk.cyan(JSON.stringify(meta))}`;
    }

    return logMsg;
  },
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp(),
    myFormat,
  ),
});

// Log rotation: keeps 14 20MB files, rotates daily
const fileTransport = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

/**
 * CustomLogger supporting log levels, emoji, context, rotation, metadata,
 * and compatible with NestJS LoggerService.
 */
export default class CustomLogger implements LoggerService {
  private logger!: winston.Logger;
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
    this.defineLogger();
  }

  public setContext(context: string) {
    this.context = context;
  }

  public getLogger(): winston.Logger {
    return this.logger;
  }

  private defineLogger(): void {
    const env = process.env.NODE_ENV || 'development';
    const logLevel =
      process.env.LOG_LEVEL || (env === 'production' ? 'warn' : 'debug');

    this.logger = winston.createLogger({
      levels: customLevels.levels,
      defaultMeta: { service: 'omni-auth-service' },
      level: logLevel,
      transports: [consoleTransport, fileTransport],
      exitOnError: false,
    });
  }

  // General purpose log with metadata/context
  public logWithContext(
    level: CustomLogLevels,
    message: string,
    meta?: Record<string, any>,
  ) {
    this.logger.log(level, sanitize(message), {
      context: this.context,
      ...meta,
    });
  }

  // Convenience methods for all log levels
  public crit(message: string, meta?: Record<string, any>) {
    this.logWithContext('crit', message, meta);
  }
  public error(message: string, trace?: string, meta?: Record<string, any>) {
    this.logWithContext('error', message, { stack: trace, ...meta });
  }
  public warn(message: string, meta?: Record<string, any>) {
    this.logWithContext('warn', message, meta);
  }
  public debug(message: string, meta?: Record<string, any>) {
    this.logWithContext('debug', message, meta);
  }
  public verbose(message: string, meta?: Record<string, any>) {
    this.logWithContext('verbose', message, meta);
  }
  public success(message: string, meta?: Record<string, any>) {
    this.logWithContext('success', message, meta);
  }
  public info(message: string, meta?: Record<string, any>) {
    this.logWithContext('info', message, meta);
  }

  // Required by NestJS LoggerService
  log(message: any, meta?: Record<string, any>) {
    this.info(message, meta);
  }
}
