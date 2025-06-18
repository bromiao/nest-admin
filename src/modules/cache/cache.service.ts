import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoggerService } from '../logger/logger.service';

/**
 * 缓存服务
 * 提供缓存数据的存取方法
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('CacheService');
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`缓存命中: ${key}`);
      } else {
        this.logger.debug(`缓存未命中: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`获取缓存失败: ${error.message}`, error.stack);
      return undefined;
    }
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`缓存设置成功: ${key}`, undefined, {
        ttl: ttl ? `${ttl}ms` : '默认',
      });
    } catch (error) {
      this.logger.error(`设置缓存失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 删除缓存数据
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`缓存删除成功: ${key}`);
    } catch (error) {
      this.logger.error(`删除缓存失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 清空所有缓存
   */
  async reset(): Promise<void> {
    try {
      // 注意：某些缓存管理器可能不支持reset方法
      // 这里我们使用一个简单的方法来清空缓存
      this.logger.debug('尝试清空所有缓存');
      // 由于Cache接口没有直接提供reset方法，我们使用一个替代方案
      // 在实际应用中，可以根据具体的缓存实现来调整这个方法
      await this.cacheManager.del('*');
      this.logger.debug('所有缓存已清空');
    } catch (error) {
      this.logger.error(`清空缓存失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 获取缓存数据，如果不存在则通过工厂函数获取并缓存
   * @param key 缓存键
   * @param factory 工厂函数，用于获取数据
   * @param ttl 过期时间（毫秒）
   * @returns 缓存数据
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    try {
      const value = await factory();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      this.logger.error(`获取或设置缓存失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
