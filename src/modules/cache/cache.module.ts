import { Module, Global, DynamicModule } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { LoggerService } from '../logger/logger.service';
import { getRedisConfig, isRedisEnabled } from '../../config/redis.config';

/**
 * 全局缓存模块
 * 使用IORedis提供高性能的Redis缓存服务
 * 支持通过环境变量控制启用/禁用
 */
@Global()
@Module({})
export class CacheModule {
  static forRoot(): DynamicModule {
    const dynamicImports: any[] = [];

    // 总是导入RedisModule，但在useFactory中判断是否启用
    dynamicImports.push(
      RedisModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const redisConfig = getRedisConfig(configService);

          if (!redisConfig.enabled) {
            console.log('Redis已禁用，使用内存缓存模式');
            // 返回一个无效配置，让Redis连接失败，CacheService会自动降级到内存模式
            return {
              type: 'single',
              options: {
                host: 'disabled',
                port: 0,
                lazyConnect: true,
                maxRetriesPerRequest: 0,
                enableOfflineQueue: false,
              },
            };
          }

          console.log('Redis已启用，正在连接Redis服务器...');
          console.log('IORedis配置:', {
            host: redisConfig.host,
            port: redisConfig.port,
            db: redisConfig.db,
            keyPrefix: redisConfig.keyPrefix,
          });

          return {
            type: 'single',
            options: {
              host: redisConfig.host,
              port: redisConfig.port,
              password: redisConfig.password,
              db: redisConfig.db,
              keyPrefix: redisConfig.keyPrefix,
              // 基本配置
              enableReadyCheck: true,
              maxRetriesPerRequest: 3,
              lazyConnect: false,
              enableOfflineQueue: true,
              connectTimeout: 10000,
              commandTimeout: 5000,
            },
          };
        },
        inject: [ConfigService],
      }),
    );

    return {
      module: CacheModule,
      imports: dynamicImports,
      controllers: [CacheController],
      providers: [
        CacheService,
        LoggerService,
        // 提供Redis启用状态
        {
          provide: 'REDIS_ENABLED',
          useFactory: (configService: ConfigService) => {
            return isRedisEnabled(configService);
          },
          inject: [ConfigService],
        },
      ],
      exports: [CacheService],
    };
  }
}
