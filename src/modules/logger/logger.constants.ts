/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * 日志类型
 */
export enum LogType {
  HTTP = 'http',
  APPLICATION = 'application',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
}

/**
 * 日志格式选项
 */
export interface LogFormatOptions {
  timestamp?: boolean;
  level?: boolean;
  context?: boolean;
  colors?: boolean;
}

/**
 * 日志配置选项
 */
export interface LoggerOptions {
  /**
   * 日志级别
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * 是否启用控制台日志
   * @default true
   */
  console?: boolean;

  /**
   * 是否启用文件日志
   * @default true
   */
  file?: boolean;

  /**
   * 日志文件目录
   * @default 'logs'
   */
  dir?: string;

  /**
   * 日志文件最大大小
   * @default '20m'
   */
  maxSize?: string;

  /**
   * 日志文件保留天数
   * @default '14d'
   */
  maxFiles?: string;

  /**
   * 是否启用压缩
   * @default true
   */
  zippedArchive?: boolean;

  /**
   * 日志格式选项
   */
  format?: LogFormatOptions;
}
