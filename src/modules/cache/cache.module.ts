import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { LoggerService } from '../logger/logger.service';

/**
 * 全局缓存模块
 * 提供缓存服务，可以被应用中的任何模块使用
 */
@Global()
@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 1000, // 默认缓存时间为1小时
      max: 100, // 最大缓存项数
    }),
  ],
  controllers: [CacheController],
  providers: [CacheService, LoggerService],
  exports: [CacheService],
})
export class CacheModule {}
