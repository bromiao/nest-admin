import { SetMetadata } from '@nestjs/common';

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 缓存键，支持模板变量 */
  key: string;
  /** 过期时间（秒） */
  ttl?: number;
  /** 是否启用缓存 */
  enabled?: boolean;
  /** 缓存条件函数 */
  condition?: (...args: any[]) => boolean;
}

/**
 * 缓存键常量
 */
export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_CONFIG_METADATA = 'cache:config';

/**
 * 缓存装饰器
 * 用于标记需要缓存的方法
 *
 * @param config 缓存配置
 *
 * @example
 * ```typescript
 * @Cacheable({ key: 'user:${id}', ttl: 300 })
 * async getUserById(id: number) {
 *   return this.userRepository.findOne(id);
 * }
 * ```
 */
export const Cacheable = (config: CacheConfig | string) => {
  const cacheConfig: CacheConfig =
    typeof config === 'string' ? { key: config } : config;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 获取缓存服务
      const cacheService = this.cacheService;
      if (!cacheService) {
        console.warn('缓存服务未注入，无法使用缓存装饰器');
        return await originalMethod.apply(this, args);
      }

      // 生成缓存键
      const cacheKey = parseCacheKey(cacheConfig.key, args);

      // 检查缓存条件
      if (cacheConfig.condition && !cacheConfig.condition(...args)) {
        return originalMethod.apply(this, args);
      }

      // 使用缓存服务的getOrSet方法
      return cacheService.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        cacheConfig.ttl,
      );
    };

    // 同时设置元数据供拦截器使用
    SetMetadata(CACHE_CONFIG_METADATA, cacheConfig)(
      target,
      propertyKey,
      descriptor,
    );
    return descriptor;
  };
};

/**
 * 缓存清除装饰器
 * 用于标记需要清除缓存的方法
 *
 * @param keys 要清除的缓存键或模式
 *
 * @example
 * ```typescript
 * @CacheEvict(['user:${id}', 'users:*'])
 * async updateUser(id: number, data: UpdateUserDto) {
 *   return this.userRepository.update(id, data);
 * }
 * ```
 */
export const CacheEvict = (keys: string | string[]) => {
  const cacheKeys = Array.isArray(keys) ? keys : [keys];

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 获取缓存服务
      const cacheService = this.cacheService;
      if (cacheService) {
        // 清除相关缓存
        for (const keyTemplate of cacheKeys) {
          try {
            const cacheKey = parseCacheKey(keyTemplate, args);
            if (cacheKey.includes('*')) {
              await cacheService.deleteByPattern(cacheKey);
            } else {
              await cacheService.delete(cacheKey);
            }
          } catch (error) {
            console.warn(`清除缓存失败: ${keyTemplate}`, error);
          }
        }
      }

      return result;
    };

    SetMetadata('cache:evict', cacheKeys)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * 缓存更新装饰器
 * 用于标记需要更新缓存的方法
 *
 * @param config 缓存配置
 *
 * @example
 * ```typescript
 * @CachePut({ key: 'user:${id}', ttl: 300 })
 * async updateUser(id: number, data: UpdateUserDto) {
 *   const user = await this.userRepository.update(id, data);
 *   return user;
 * }
 * ```
 */
export const CachePut = (config: CacheConfig | string) => {
  const cacheConfig: CacheConfig =
    typeof config === 'string' ? { key: config } : config;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 获取缓存服务
      const cacheService = this.cacheService;
      if (cacheService && result !== null && result !== undefined) {
        try {
          const cacheKey = parseCacheKey(cacheConfig.key, args);
          await cacheService.set(cacheKey, result, cacheConfig.ttl);
        } catch (error) {
          console.warn(`更新缓存失败: ${cacheConfig.key}`, error);
        }
      }

      return result;
    };

    SetMetadata('cache:put', cacheConfig)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * 解析缓存键模板
 * 将模板变量替换为实际值
 *
 * @param template 键模板，如 'user:${0}' 或 'user:${id}'
 * @param args 方法参数
 * @param paramNames 参数名称数组
 * @returns 解析后的键
 */
export function parseCacheKey(
  template: string,
  args: any[],
  paramNames?: string[],
): string {
  let key = template;

  // 替换位置参数 ${0}, ${1}, etc.
  args.forEach((arg, index) => {
    const placeholder = `\${${index}}`;
    if (key.includes(placeholder)) {
      const value = typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      key = key.replace(new RegExp(`\\$\\{${index}\\}`, 'g'), value);
    }
  });

  // 替换命名参数 ${paramName}
  if (paramNames) {
    paramNames.forEach((paramName, index) => {
      const placeholder = `\${${paramName}}`;
      if (key.includes(placeholder) && args[index] !== undefined) {
        const value =
          typeof args[index] === 'object'
            ? JSON.stringify(args[index])
            : String(args[index]);
        key = key.replace(new RegExp(`\\$\\{${paramName}\\}`, 'g'), value);
      }
    });
  }

  // 替换对象属性 ${arg.property}
  const objectPropertyRegex = /\$\{(\w+)\.(\w+)\}/g;
  key = key.replace(objectPropertyRegex, (match, argName, property) => {
    const argIndex = paramNames?.indexOf(argName);
    if (argIndex !== undefined && argIndex >= 0 && args[argIndex]) {
      const value = args[argIndex][property];
      return value !== undefined ? String(value) : match;
    }
    return match;
  });

  return key;
}

/**
 * 传统的缓存方法装饰器（保持向后兼容）
 * 用于缓存方法的返回值
 */
export function CacheableMethod(keyPrefix: string, ttl?: number) {
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
        return await originalMethod.apply(this, args);
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
