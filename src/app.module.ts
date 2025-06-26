import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestConsoleController } from './test-console.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookModule } from './modules/book/book.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionParams } from './config/migration.config'; // 引入数据库连接配置
import { MenuModule } from './modules/menu/menu.module';
import { ContentsModule } from './modules/contents/contents.module';
import { RoleModule } from './modules/role/role.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { LoggerService } from './modules/logger/logger.service';
import { LoggingInterceptor } from './modules/logger/logger.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LogLevel } from './modules/logger/logger.constants';
import { CacheModule } from './modules/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { OrmModule } from './modules/orm/orm.module';

/**
 * 应用程序主模块
 * 负责组织和连接应用程序的各个部分
 */
@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
      expandVariables: true,
      load: [require('./config/app.config').default],
    }),

    // ORM模块 - 全局模块，提供ORM工厂服务
    OrmModule,

    // Prisma模块 - 全局模块，提供Prisma服务
    PrismaModule,

    // 日志模块 - 使用自定义配置
    LoggerModule.forRoot({
      level:
        process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      console: true,
      file: true,
      format: {
        timestamp: true,
        level: true,
        context: true,
        colors: true,
      },
    }),

    // 缓存模块 - 使用动态模块支持Redis开关
    CacheModule.forRoot(),

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
  controllers: [AppController, TestConsoleController],
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
