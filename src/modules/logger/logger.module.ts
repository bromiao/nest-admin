import { DynamicModule, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createLoggerConfig, loggerConfig } from './logger.config';
import { LoggerOptions } from './logger.constants';

@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {
  /**
   * 使用自定义配置注册日志模块
   * @param options 日志配置选项
   * @returns 动态模块
   */
  static forRoot(options?: Partial<LoggerOptions>): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        WinstonModule.forRoot(createLoggerConfig(options)),
      ],
      exports: [WinstonModule],
    };
  }
}
