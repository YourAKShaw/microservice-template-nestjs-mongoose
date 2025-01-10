import * as emoji from 'node-emoji';
import * as winston from 'winston';
import chalk from 'chalk';

export default class CustomLogger {
  private logger!: winston.Logger;
  private context: string;

  constructor(context: string) {
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
    const customLevels: any = {
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

    // Bind the context explicitly
    const myFormat = winston.format.printf((info) => {
      let emojiToLog = '';
      const level = info.level.replace(/\x1B\[[0-9;]*m/g, ''); // Remove color codes for comparison

      switch (level) {
        case 'crit':
          emojiToLog = emoji.get('skull');
          break;
        case 'error':
          emojiToLog = emoji.get('x');
          break;
        case 'warn':
          emojiToLog = emoji.get('rotating_light');
          break;
        case 'debug':
          emojiToLog = emoji.get('bug');
          break;
        case 'verbose':
          emojiToLog = emoji.get('eye') + ' ';
          break;
        case 'success':
          emojiToLog = emoji.get('white_check_mark');
          break;
        case 'info':
          emojiToLog = emoji.get('information_source') + ' ';
          break;
        default:
          emojiToLog = emoji.get('grey_question');
      }

      const timestamp = new Date(info.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      return (
        `${chalk.green('[Winston]')}     ` +
        `${chalk.green('-')} ${timestamp}     ` +
        `${chalk.green('LOG')} ` +
        `${chalk.yellow(`[${this.context}]`)} ` +
        `${emojiToLog} [${info.level}]:  ` +
        `${info.message}` +
        (info.splat !== undefined ? `${info.splat}` : ' ')
      );
    });

    const consoleTransport: winston.transport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        myFormat,
      ),
    });

    const fileTransport: winston.transport = new winston.transports.File({
      filename: 'combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    });

    this.logger = winston.createLogger({
      defaultMeta: { service: 'omni-auth-service' },
      levels: customLevels.levels,
      transports: [consoleTransport, fileTransport],
      format: winston.format.combine(winston.format.timestamp(), myFormat),
    });
  }

  // Add an additional method to log with the context explicitly
  public logWithContext(level: string, message: string) {
    this.logger.log(level, message, { context: this.context });
  }
}
