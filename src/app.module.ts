import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookModule } from './modules/book/book.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionParams } from './utils/ormconfig';
import { MenuModule } from './modules/menu/menu.module';
import { ContentsModule } from './modules/contents/contents.module';
import { RoleModule } from './modules/role/role.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { LoggerService } from './modules/logger/logger.service';
import { LoggingInterceptor } from './modules/logger/logger.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LogLevel } from './modules/logger/logger.constants';
import { getServerConfig } from './utils/common';

/**
 * 应用程序主模块
 * 负责组织和连接应用程序的各个部分
 */
@Module({
  imports: [
    // 日志模块 - 使用自定义配置
    LoggerModule.forRoot({
      level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      console: true,
      file: true,
      format: {
        timestamp: true,
        level: true,
        context: true,
        colors: true,
      },
    }),
    // 配置TypeORM数据库连接
    TypeOrmModule.forRoot(connectionParams),
    // 功能模块
    UserModule,
    AuthModule,
    BookModule,
    MenuModule,
    ContentsModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    LoggerService,
    // 全局日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用日志中间件到所有路由
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
