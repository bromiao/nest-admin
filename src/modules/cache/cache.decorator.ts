import { SetMetadata } from '@nestjs/common';

/**
 * 缓存键元数据
 */
export const CACHE_KEY_METADATA = 'cache_key_metadata';

/**
 * 缓存TTL元数据
 */
export const CACHE_TTL_METADATA = 'cache_ttl_metadata';

/**
 * 设置缓存键装饰器
 * @param key 缓存键
 * @returns 装饰器
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * 设置缓存TTL装饰器
 * @param ttl 过期时间（毫秒）
 * @returns 装饰器
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * 缓存方法装饰器
 * 用于缓存方法的返回值
 */
export function Cacheable(keyPrefix: string, ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // 获取缓存服务
      const cacheService = this.cacheService;
      if (!cacheService) {
        console.warn('缓存服务未注入，无法使用缓存装饰器');
        return originalMethod.apply(this, args);
      }
      
      // 生成缓存键
      const argsString = args.length ? JSON.stringify(args) : '';
      const cacheKey = `${keyPrefix}:${propertyKey}:${argsString}`;
      
      // 使用缓存服务的getOrSet方法
      return cacheService.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttl,
      );
    };
    
    return descriptor;
  };
}
