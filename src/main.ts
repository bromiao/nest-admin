import * as fs from 'node:fs';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerConfig } from './utils/common';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

/**
 * 获取HTTPS证书配置
 * 用于启用HTTPS服务
 */
const dir = process.cwd();
const httpsOptions = {
  key: fs.readFileSync(path.resolve(dir, './https/localhost+2-key.pem')),
  cert: fs.readFileSync(path.resolve(dir, './https/localhost+2.pem')),
};

/**
 * 应用程序启动函数
 * 初始化NestJS应用并配置全局中间件
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // 创建带HTTPS的NestJS应用实例
    const app = await NestFactory.create(AppModule, {
      cors: true, // 启用CORS
      httpsOptions, // 配置HTTPS
      logger: ['error', 'warn', 'log', 'debug'], // 配置日志级别
    });

    // 使用Helmet增强安全性
    app.use(helmet());

    // 全局管道 - 用于请求验证
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // 过滤掉未在DTO中声明的属性
        transform: true, // 自动转换类型
        forbidNonWhitelisted: true, // 禁止未在白名单中的属性
        transformOptions: {
          enableImplicitConversion: true, // 启用隐式类型转换
        },
      }),
    );

    // 全局异常过滤器 - 统一处理HTTP异常
    app.useGlobalFilters(new HttpExceptionFilter());

    // 设置全局路由前缀
    // app.setGlobalPrefix('api');

    // 获取配置的端口或使用默认端口3000
    const port = Number(getServerConfig().APP_PORT ?? 3000);

    // 启动应用
    await app.listen(port);
    logger.log(`Application is running on: https://localhost:${port}`);
    logger.log(`API documentation available at: https://localhost:${port}/api`);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

// 启动应用
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});
