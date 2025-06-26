import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { getServerConfig } from '../../utils/common';
import { LogLevel, LoggerOptions } from './logger.constants';
import * as chalk from 'chalk'; // 修改为 CommonJS 导入方式

// 确保日志目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 获取环境配置
const config = getServerConfig();
const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';

// 从配置中获取日志级别，默认为info
const configLogLevel = config['LOG_LEVEL'] || 'info';

// 根据环境和配置确定日志级别
const determineLogLevel = (): LogLevel => {
  if (isDevelopment) {
    return LogLevel.DEBUG;
  }

  // 确保configLogLevel是字符串
  const logLevelStr = String(configLogLevel).toLowerCase();

  switch (logLevelStr) {
    case 'error':
      return LogLevel.ERROR;
    case 'warn':
      return LogLevel.WARN;
    case 'debug':
      return LogLevel.DEBUG;
    case 'verbose':
      return LogLevel.VERBOSE;
    case 'info':
    default:
      return LogLevel.INFO;
  }
};

// 当前日志级别
const currentLogLevel = determineLogLevel();

// 自定义颜色
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'cyan',
};

// 添加自定义颜色
winston.addColors(customColors);

// 日志格式 - 用于控制台输出
const consoleLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('NestAdmin', {
    colors: true,
    prettyPrint: true,
  }),
);

// 控制台日志格式 - 使用chalk为上下文添加橙黄色
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  winston.format.colorize({ all: false, level: true }),
  winston.format.printf((info) => {
    // 使用chalk.hex('#FFA500')将上下文设置为橙黄色
    const context = info.context || 'Application';
    const coloredContext = chalk.hex('#FFA500').bold(`[${String(context)}]`);

    // 处理消息中的对象
    const message = chalk.cyan(info.message);

    // 如果有元数据，添加到输出中
    let metaOutput = '';

    // 检查是否有data字段
    if (info.data) {
      metaOutput = `\n${chalk.blueBright('Data:')} ${chalk.cyan(JSON.stringify(info.data, null, 2))}`;
    }

    // 检查是否有responseTime字段
    if (info.responseTime) {
      metaOutput += `\n${chalk.blueBright('Response Time:')} ${chalk.cyan(String(info.responseTime) + 'ms')}`;
    }

    // 如果有其他元数据字段，也添加到输出中
    const metaFields = Object.keys(info).filter(
      (key) =>
        ![
          'timestamp',
          'level',
          'message',
          'ms',
          'context',
          'data',
          'responseTime',
        ].includes(key),
    );

    if (metaFields.length > 0) {
      const meta = metaFields.reduce((acc, key) => {
        acc[key] = info[key];
        return acc;
      }, {});

      if (Object.keys(meta).length > 0) {
        metaOutput += `\n${chalk.blueBright('Meta:')} ${chalk.cyan(JSON.stringify(meta, null, 2))}`;
      }
    }

    return `${chalk.magenta(info.timestamp)} ${info.level} ${coloredContext} ${message}${metaOutput}`;
  }),
);

// 文件日志格式
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  winston.format.json(),
);

// 创建日志轮转配置
const createDailyRotateTransport = (level: string, filename: string) => {
  return new DailyRotateFile({
    level,
    dirname: logDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  });
};

// 默认日志配置选项
const defaultLoggerOptions: LoggerOptions = {
  level: currentLogLevel,
  console: true,
  file: true,
  dir: logDir,
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
  format: {
    timestamp: true,
    level: true,
    context: true,
    colors: true,
  },
};

// 创建日志配置
export const createLoggerConfig = (options: Partial<LoggerOptions> = {}) => {
  // 合并默认选项和自定义选项
  const mergedOptions: LoggerOptions = {
    ...defaultLoggerOptions,
    ...options,
  };

  const transports: winston.transport[] = [];

  // 添加控制台传输
  if (mergedOptions.console) {
    transports.push(
      new winston.transports.Console({
        level: mergedOptions.level,
        format: consoleFormat,
      }),
    );
  }

  // 添加文件传输
  if (mergedOptions.file) {
    // 信息日志文件
    transports.push(createDailyRotateTransport('info', 'application'));

    // 错误日志文件
    transports.push(createDailyRotateTransport('error', 'error'));

    // 警告日志文件
    transports.push(createDailyRotateTransport('warn', 'warn'));

    // 调试日志文件 (仅在开发环境或明确指定)
    if (isDevelopment || mergedOptions.level === LogLevel.DEBUG) {
      transports.push(createDailyRotateTransport('debug', 'debug'));
    }
  }

  return {
    level: mergedOptions.level,
    transports,
  };
};

// 导出默认日志配置
export const loggerConfig = createLoggerConfig();
