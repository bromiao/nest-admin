import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { LogLevel } from './logger.constants';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * 设置日志上下文
   * @param context 上下文名称
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * 格式化对象为字符串
   * @param obj 要格式化的对象
   * @returns 格式化后的字符串
   */
  private formatObject(obj: any): string {
    if (typeof obj === 'object' && obj !== null) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return '[Object]';
      }
    }
    return obj;
  }

  /**
   * 记录日志
   * @param message 日志消息
   * @param context 上下文
   * @param meta 元数据
   */
  log(message: any, context?: string, meta?: Record<string, any>) {
    // 如果消息是对象，则格式化它
    const formattedMessage = typeof message === 'object' ? this.formatObject(message) : message;
    
    return this.logger.info(formattedMessage, { 
      context: context || this.context,
      ...meta
    });
  }

  /**
   * 记录错误日志
   * @param message 错误消息
   * @param trace 错误堆栈
   * @param context 上下文
   * @param meta 元数据
   */
  error(message: any, trace?: string, context?: string, meta?: Record<string, any>) {
    const formattedMessage = typeof message === 'object' ? this.formatObject(message) : message;
    
    return this.logger.error(formattedMessage, { 
      context: context || this.context,
      trace,
      ...meta
    });
  }

  /**
   * 记录警告日志
   * @param message 警告消息
   * @param context 上下文
   * @param meta 元数据
   */
  warn(message: any, context?: string, meta?: Record<string, any>) {
    const formattedMessage = typeof message === 'object' ? this.formatObject(message) : message;
    
    return this.logger.warn(formattedMessage, { 
      context: context || this.context,
      ...meta
    });
  }

  /**
   * 记录调试日志
   * @param message 调试消息
   * @param context 上下文
   * @param meta 元数据
   */
  debug(message: any, context?: string, meta?: Record<string, any>) {
    const formattedMessage = typeof message === 'object' ? this.formatObject(message) : message;
    
    return this.logger.debug(formattedMessage, { 
      context: context || this.context,
      ...meta
    });
  }

  /**
   * 记录详细日志
   * @param message 详细消息
   * @param context 上下文
   * @param meta 元数据
   */
  verbose(message: any, context?: string, meta?: Record<string, any>) {
    const formattedMessage = typeof message === 'object' ? this.formatObject(message) : message;
    
    return this.logger.verbose(formattedMessage, { 
      context: context || this.context,
      ...meta
    });
  }

  /**
   * 记录带有元数据的日志
   * @param level 日志级别
   * @param message 日志消息
   * @param meta 元数据
   */
  logWithMeta(level: LogLevel, message: string, meta: Record<string, any>) {
    // 确保元数据中的对象被格式化为字符串
    const formattedMeta = Object.entries(meta).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'object' && value !== null ? this.formatObject(value) : value;
      return acc;
    }, {} as Record<string, any>);
    
    switch (level) {
      case LogLevel.ERROR:
        return this.error(message, formattedMeta.trace, undefined, formattedMeta);
      case LogLevel.WARN:
        return this.warn(message, undefined, formattedMeta);
      case LogLevel.DEBUG:
        return this.debug(message, undefined, formattedMeta);
      case LogLevel.VERBOSE:
        return this.verbose(message, undefined, formattedMeta);
      case LogLevel.INFO:
      default:
        return this.log(message, undefined, formattedMeta);
    }
  }

  /**
   * 记录HTTP请求日志
   * @param method HTTP方法
   * @param url 请求URL
   * @param statusCode 状态码
   * @param responseTime 响应时间
   * @param userAgent 用户代理
   * @param ip IP地址
   */
  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    ip?: string,
  ) {
    const meta = {
      method,
      url,
      statusCode,
      responseTime,
      userAgent,
      ip,
    };

    let level = LogLevel.INFO;
    if (statusCode >= 500) {
      level = LogLevel.ERROR;
    } else if (statusCode >= 400) {
      level = LogLevel.WARN;
    }

    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    this.logWithMeta(level, message, meta);
  }
}
