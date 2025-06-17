import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
  Optional,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../modules/logger/logger.service';

/**
 * 全局HTTP异常过滤器
 * 捕获并处理所有HttpException类型的异常
 * 提供统一的响应格式和日志记录
 */
@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: LoggerService | Logger;

  constructor(
    @Optional()
    @Inject(LoggerService)
    private readonly loggerService?: LoggerService,
  ) {
    if (loggerService) {
      this.logger = loggerService;
      // 确保loggerService存在再调用setContext
      loggerService.setContext(HttpExceptionFilter.name);
    } else {
      this.logger = new Logger(HttpExceptionFilter.name);
    }
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message || 'Internal server error';
    const exceptionResponse = exception.getResponse();

    // 记录异常日志
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack,
    );

    // 构建统一的错误响应格式
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      // 如果异常响应是对象且包含message字段，则使用它
      ...(typeof exceptionResponse === 'object' ? exceptionResponse : {}),
    };

    response.status(status).json(errorResponse);
  }
}
