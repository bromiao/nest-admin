import * as fs from 'node:fs';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerConfig } from './utils/common';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './modules/logger/logger.service';

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
 * 设置Swagger文档
 * 仅在测试环境中启用
 * @param app NestJS应用实例
 * @param port 应用端口
 * @param logger 日志服务
 */
function setupSwagger(app, port, logger) {
  // 配置Swagger文档
  const config = new DocumentBuilder()
    .setTitle('NestJS Admin API')
    .setDescription('NestJS Admin API 文档 (仅测试环境可用)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入JWT token',
        in: 'header',
      },
      'JWT-auth', // 这是一个标识，在装饰器中使用
    )
    .addTag('auth', '认证相关')
    .addTag('user', '用户管理')
    .addTag('book', '书籍管理')
    .addTag('menu', '菜单管理')
    .addTag('contents', '内容管理')
    .addTag('role', '角色管理')
    .addServer(`https://localhost:${port}/api`) // 添加服务器URL，包含api前缀
    .build();

  // 创建Swagger文档，并排除重复的模块
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
    ignoreGlobalPrefix: true, // 设置为true，忽略全局前缀
    deepScanRoutes: true, // 深度扫描路由
    extraModels: [], // 添加额外的模型
  });

  // 从文档中删除默认路由
  if (document.paths['/']) {
    delete document.paths['/'];
  }

  // 设置Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      defaultModelsExpandDepth: -1, // 隐藏默认的Models部分
    },
    customSiteTitle: 'NestJS Admin API 文档',
    customCss: '.swagger-ui .topbar { display: none }', // 隐藏顶部栏
  });

  logger.log(
    `Swagger documentation available at: https://localhost:${port}/api/docs`,
  );
}

/**
 * 应用程序启动函数
 * 初始化NestJS应用并配置全局中间件
 */
async function bootstrap() {
  // 创建一个标准的Logger用于启动过程
  const bootstrapLogger = new Logger('Bootstrap');
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isTestEnv = nodeEnv === 'test';
  const isDevelopment = nodeEnv === 'development';

  try {
    // 创建带HTTPS的NestJS应用实例
    const app = await NestFactory.create(AppModule, {
      cors: true, // 启用CORS
      httpsOptions, // 配置HTTPS
      bufferLogs: false, // 禁用日志缓冲，立即输出
      logger: ['error', 'warn', 'log', 'debug', 'verbose'], // 使用内置日志器，包含所有级别
    });

    // 临时注释掉Winston日志服务，使用默认的console输出
    const logger = await app.resolve(LoggerService);
    logger.setContext('Bootstrap');
    app.useLogger(logger);

    // 使用Helmet增强安全性，但配置为允许Swagger UI工作
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          },
        },
      }),
    );

    // 全局管道 - 用于请求验证
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // 过滤掉未在DTO中声明的属性
        transform: true, // 自动转换类型
        forbidNonWhitelisted: true, // 禁止未在白名单中的属性
        transformOptions: {
          enableImplicitConversion: true, // 启用隐式类型转换
        },
        // 在开发环境下提供详细的错误信息
        disableErrorMessages: !isDevelopment,
        validationError: {
          target: isDevelopment,
          value: isDevelopment,
        },
      }),
    );

    // 全局异常过滤器 - 统一处理HTTP异常
    // 使用resolve而不是get来处理作用域提供者
    const exceptionFilter = await app.resolve(HttpExceptionFilter);
    app.useGlobalFilters(exceptionFilter);

    // 设置全局路由前缀
    app.setGlobalPrefix('api');

    // 获取配置的端口或使用默认端口3030
    const port = Number(getServerConfig().APP_PORT ?? 3030);

    // 仅在测试环境中启用Swagger
    if (isTestEnv) {
      setupSwagger(app, port, bootstrapLogger);
    }

    // 启动应用
    await app.listen(port);
    bootstrapLogger.log(`Application is running on: https://localhost:${port}`);
    bootstrapLogger.log(`Environment: ${nodeEnv}`);
  } catch (error) {
    bootstrapLogger.error(
      `Failed to start application: ${error.message}`,
      error.stack,
    );
    process.exit(1);
  }
}

// 启动应用
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});
