import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { Reflector } from '@nestjs/core';
import {
  LOG_LEVEL_KEY,
  SKIP_LOG_KEY,
  LOG_CONTEXT_KEY,
} from './logger.decorator';
import { LogLevel } from './logger.constants';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 检查是否跳过日志
    const skipLog = this.reflector.getAllAndOverride<boolean>(SKIP_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipLog) {
      return next.handle();
    }

    // 获取日志上下文
    const logContext = this.reflector.getAllAndOverride<string>(
      LOG_CONTEXT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (logContext) {
      this.logger.setContext(logContext);
    } else {
      const className = context.getClass().name;
      const methodName = context.getHandler().name;
      this.logger.setContext(`${className}:${methodName}`);
    }

    // 获取日志级别
    const logLevel =
      (this.reflector.getAllAndOverride<string>(LOG_LEVEL_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) as LogLevel) || LogLevel.INFO;

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const { method, url, body, params, query } = request;

      // 记录请求信息
      this.logger.logWithMeta(LogLevel.DEBUG, `Request: ${method} ${url}`, {
        method,
        url,
        body: Object.keys(body || {}).length > 0 ? body : undefined,
        params: Object.keys(params || {}).length > 0 ? params : undefined,
        query: Object.keys(query || {}).length > 0 ? query : undefined,
      });
    }

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;

          // 始终记录完整的响应数据，无论日志级别如何
          this.logger.logWithMeta(
            logLevel,
            `Response data (${responseTime}ms):`,
            {
              responseTime,
              data: JSON.stringify(data, null, 2), // 格式化JSON以便更好地阅读
            },
          );

          // 记录响应时间
          this.logger.debug(`Response: ${responseTime}ms`);
        },
        error: (err) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Error: ${responseTime}ms - ${err.message}`,
            err.stack,
            undefined,
            {
              responseTime,
              error: err.name,
              message: err.message,
            },
          );
        },
      }),
    );
  }
}
