import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    // 请求开始时间
    const startTime = Date.now();

    // 记录请求信息
    this.logger.debug(`Request: ${method} ${originalUrl}`, undefined, {
      method,
      url: originalUrl,
      ip,
      userAgent,
    });

    // 响应完成时的处理
    res.on('finish', () => {
      const { statusCode } = res;
      // const contentLength = res.get('content-length') || 0; // 暂时不使用
      const responseTime = Date.now() - startTime;

      // 使用新的logHttpRequest方法记录HTTP请求
      this.logger.logHttpRequest(
        method,
        originalUrl,
        statusCode,
        responseTime,
        userAgent,
        ip,
      );
    });

    next();
  }
}
