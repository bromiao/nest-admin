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
import { CACHE_CONFIG_METADATA, CacheConfig } from './cache.decorator';
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
    // 获取请求信息
    const request = context.switchToHttp().getRequest();
    const { method, params, query, body, user } = request;

    // 获取缓存配置
    const cacheConfig = this.reflector.get<CacheConfig>(
      CACHE_CONFIG_METADATA,
      context.getHandler(),
    );

    // 如果没有缓存配置，则不缓存
    if (!cacheConfig) {
      return next.handle();
    }

    // 检查是否启用缓存
    if (cacheConfig.enabled === false) {
      return next.handle();
    }

    // 只缓存GET请求（除非明确配置）
    if (method !== 'GET') {
      return next.handle();
    }

    // 构建缓存键解析上下文
    const keyContext = {
      params: params || {},
      query: query || {},
      body: body || {},
      user: user || {},
      method,
      path: request.path,
    };

    // 解析缓存键
    let cacheKey: string;
    try {
      cacheKey = this.parseCacheKeyWithContext(cacheConfig.key, keyContext);
    } catch (error) {
      this.logger.error(`解析缓存键失败: ${error.message}`, error.stack);
      return next.handle();
    }

    // 检查缓存条件
    if (
      cacheConfig.condition &&
      !cacheConfig.condition(params, query, body, user)
    ) {
      this.logger.debug(`缓存条件不满足，跳过缓存: ${cacheKey}`);
      return next.handle();
    }

    // 尝试从缓存中获取数据
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData !== undefined) {
      this.logger.debug(`使用缓存数据: ${cacheKey}`);
      return of(cachedData);
    }

    // 如果缓存中没有数据，则执行原始方法并缓存结果
    return next.handle().pipe(
      tap(async (data) => {
        try {
          // 只缓存非空数据
          if (data !== null && data !== undefined) {
            await this.cacheService.set(cacheKey, data, cacheConfig.ttl);
            this.logger.debug(`缓存数据已设置: ${cacheKey}`, undefined, {
              ttl: cacheConfig.ttl ? `${cacheConfig.ttl}s` : '默认',
              dataType: typeof data,
            });
          }
        } catch (error) {
          this.logger.error(
            `缓存数据失败 [${cacheKey}]: ${error.message}`,
            error.stack,
          );
        }
      }),
    );
  }

  /**
   * 解析缓存键模板，支持复杂的上下文变量
   * @param template 键模板
   * @param context 上下文对象
   * @returns 解析后的键
   */
  private parseCacheKeyWithContext(template: string, context: any): string {
    let key = template;

    // 替换简单变量 ${variable}
    const simpleVariableRegex = /\$\{(\w+)\}/g;
    key = key.replace(simpleVariableRegex, (match, varName) => {
      if (context[varName] !== undefined) {
        return String(context[varName]);
      }
      return match;
    });

    // 替换对象属性 ${object.property}
    const objectPropertyRegex = /\$\{(\w+)\.(\w+)\}/g;
    key = key.replace(objectPropertyRegex, (match, objName, propName) => {
      if (context[objName] && context[objName][propName] !== undefined) {
        return String(context[objName][propName]);
      }
      return match;
    });

    // 替换深层属性 ${object.nested.property}
    const deepPropertyRegex = /\$\{(\w+(?:\.\w+)+)\}/g;
    key = key.replace(deepPropertyRegex, (match, path) => {
      const value = this.getNestedValue(context, path);
      return value !== undefined ? String(value) : match;
    });

    return key;
  }

  /**
   * 获取嵌套对象的值
   * @param obj 对象
   * @param path 属性路径，如 'user.profile.name'
   * @returns 属性值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
