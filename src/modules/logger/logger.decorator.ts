import { SetMetadata } from '@nestjs/common';

/**
 * 日志级别元数据键
 */
export const LOG_LEVEL_KEY = 'log_level';

/**
 * 设置日志级别装饰器
 * @param level 日志级别
 * @returns 装饰器
 */
export const LogLevel = (level: string) => SetMetadata(LOG_LEVEL_KEY, level);

/**
 * 跳过日志元数据键
 */
export const SKIP_LOG_KEY = 'skip_log';

/**
 * 跳过日志装饰器
 * @returns 装饰器
 */
export const SkipLog = () => SetMetadata(SKIP_LOG_KEY, true);

/**
 * 日志上下文元数据键
 */
export const LOG_CONTEXT_KEY = 'log_context';

/**
 * 设置日志上下文装饰器
 * @param context 上下文名称
 * @returns 装饰器
 */
export const LogContext = (context: string) =>
  SetMetadata(LOG_CONTEXT_KEY, context);
