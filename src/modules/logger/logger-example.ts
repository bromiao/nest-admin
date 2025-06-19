import { Controller, Get, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LogContext, LogLevel, SkipLog } from './logger.decorator';

/**
 * 日志服务使用示例
 */
@Injectable()
export class LoggerExample {
  constructor(private readonly logger: LoggerService) {
    // 设置日志上下文
    this.logger.setContext('LoggerExample');
  }

  /**
   * 记录不同级别的日志
   */
  logLevels() {
    this.logger.log('这是一条信息日志');
    this.logger.error('这是一条错误日志', '错误堆栈信息');
    this.logger.warn('这是一条警告日志');
    this.logger.debug('这是一条调试日志');
    this.logger.verbose('这是一条详细日志');
  }

  /**
   * 使用不同的上下文记录日志
   */
  logWithContext() {
    this.logger.log('默认上下文日志');
    this.logger.log('自定义上下文日志', 'CustomContext');
  }

  /**
   * 记录带有元数据的日志
   */
  logWithMetadata() {
    const user = { id: 1, username: 'admin' };
    const action = 'login';

    this.logger.log(`用户 ${user.username} 执行了 ${action} 操作`);
  }
}

/**
 * 日志控制器使用示例
 */
@Controller('logger-example')
@LogContext('LoggerExampleController')
export class LoggerExampleController {
  constructor(private readonly logger: LoggerService) {}

  @Get()
  @LogLevel('debug')
  getExample() {
    this.logger.log('这是一个示例请求');
    return { message: '日志记录成功' };
  }

  @Get('skip')
  @SkipLog()
  skipLogging() {
    return { message: '跳过日志记录' };
  }
}
