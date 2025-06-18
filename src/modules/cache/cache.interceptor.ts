import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from './cache.decorator';
import { LoggerService } from '../logger/logger.service';

/**
 * 缓存拦截器
 * 用于自动缓存控制器方法的返回值
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('CacheInterceptor');
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // 获取请求方法
    const request = context.switchToHttp().getRequest();
    const { method } = request;

    // 只缓存GET请求
    if (method !== 'GET') {
      return next.handle();
    }

    // 获取缓存键和TTL
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const ttl = this.reflector.get(CACHE_TTL_METADATA, context.getHandler());

    // 如果没有设置缓存键，则不缓存
    if (!cacheKey) {
      return next.handle();
    }

    // 尝试从缓存中获取数据
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`使用缓存数据: ${cacheKey}`);
      return of(cachedData);
    }

    // 如果缓存中没有数据，则执行原始方法并缓存结果
    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.cacheService.set(cacheKey, data, ttl);
          this.logger.debug(`缓存数据已设置: ${cacheKey}`, undefined, {
            ttl: ttl ? `${ttl}ms` : '默认',
          });
        } catch (error) {
          this.logger.error(`缓存数据失败: ${error.message}`, error.stack);
        }
      }),
    );
  }
}
