import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 全局HTTP异常过滤器
 * 捕获并处理所有HttpException类型的异常
 * 提供统一的响应格式和日志记录
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

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
