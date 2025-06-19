import { Injectable, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LoggerService } from '../logger/logger.service';
import { getRedisConfig } from '../../config/redis.config';

/**
 * 缓存服务
 * 基于IORedis提供高性能的Redis缓存功能
 * 支持Redis禁用时的优雅降级
 */
@Injectable()
export class CacheService implements OnModuleInit {
  private readonly keyPrefix: string;
  private readonly defaultTtl: number;
  private readonly redisEnabled: boolean;

  constructor(
    @Optional() @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    @Inject('REDIS_ENABLED') redisEnabled: boolean,
  ) {
    this.logger.setContext('CacheService');
    const redisConfig = getRedisConfig(this.configService);
    this.keyPrefix = redisConfig.keyPrefix;
    this.defaultTtl = redisConfig.ttl;
    this.redisEnabled = redisEnabled;
  }

  async onModuleInit() {
    if (!this.redisEnabled) {
      this.logger.warn('Redis已禁用，缓存服务将以内存模式运行');
      return;
    }

    if (!this.redis) {
      this.logger.error('Redis已启用但连接未初始化');
      return;
    }

    try {
      // 延迟测试连接，使用setTimeout返回Promise
      await new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            const pong = await this.redis.ping();
            this.logger.log(`Redis连接成功: ${pong}`);

            // 获取Redis信息
            const info = await this.redis.info('server');
            const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
            this.logger.log(`Redis版本: ${version}`);

            this.logger.log(
              `缓存服务初始化完成，使用IORedis，前缀: ${this.keyPrefix}`,
            );
          } catch (error) {
            this.logger.error(`Redis连接测试失败: ${error.message}`);
          }
          resolve();
        }, 1000);
      });
    } catch (error) {
      this.logger.error(`Redis初始化失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 检查Redis是否可用
   * @returns 是否可用
   */
  private isRedisAvailable(): boolean {
    return this.redisEnabled && this.redis && this.redis.status === 'ready';
  }

  /**
   * 生成完整的缓存键
   * @param key 原始键
   * @returns 带前缀的完整键
   */
  private getFullKey(key: string): string {
    // IORedis会自动处理keyPrefix，所以这里不需要手动添加
    return key;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.redisEnabled) {
      this.logger.debug(`Redis已禁用，跳过缓存设置: ${key}`);
      return;
    }

    if (!this.isRedisAvailable()) {
      this.logger.warn(`Redis不可用，跳过缓存设置: ${key}`);
      return;
    }

    try {
      const fullKey = this.getFullKey(key);
      const cacheTtl = ttl || this.defaultTtl;
      const serializedValue = JSON.stringify(value);

      console.log(
        `尝试设置缓存: ${this.keyPrefix}${fullKey}, TTL: ${cacheTtl}s`,
      );

      await this.redis.setex(fullKey, cacheTtl, serializedValue);

      console.log(`缓存设置成功: ${this.keyPrefix}${fullKey}`);

      this.logger.debug(
        `缓存设置成功: ${this.keyPrefix}${fullKey}`,
        undefined,
        {
          ttl: `${cacheTtl}s`,
          valueType: typeof value,
        },
      );
    } catch (error) {
      console.error(`设置缓存失败 [${key}]:`, error);
      this.logger.error(`设置缓存失败 [${key}]: ${error.message}`, error.stack);
      // 不抛出错误，允许应用继续运行
    }
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据
   */
  async get<T>(key: string): Promise<T | undefined> {
    if (!this.redisEnabled) {
      this.logger.debug(`Redis已禁用，跳过缓存获取: ${key}`);
      return undefined;
    }

    if (!this.isRedisAvailable()) {
      this.logger.warn(`Redis不可用，跳过缓存获取: ${key}`);
      return undefined;
    }

    try {
      const fullKey = this.getFullKey(key);

      console.log(`尝试获取缓存: ${this.keyPrefix}${fullKey}`);

      const value = await this.redis.get(fullKey);

      if (value !== null) {
        console.log(`缓存命中: ${this.keyPrefix}${fullKey}`);
        this.logger.debug(`缓存命中: ${this.keyPrefix}${fullKey}`);
        return JSON.parse(value) as T;
      } else {
        console.log(`缓存未命中: ${this.keyPrefix}${fullKey}`);
        this.logger.debug(`缓存未命中: ${this.keyPrefix}${fullKey}`);
        return undefined;
      }
    } catch (error) {
      console.error(`获取缓存失败 [${key}]:`, error);
      this.logger.error(`获取缓存失败 [${key}]: ${error.message}`, error.stack);
      return undefined;
    }
  }

  /**
   * 删除缓存数据
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    if (!this.redisEnabled) {
      this.logger.debug(`Redis已禁用，跳过缓存删除: ${key}`);
      return;
    }

    if (!this.isRedisAvailable()) {
      this.logger.warn(`Redis不可用，跳过缓存删除: ${key}`);
      return;
    }

    try {
      const fullKey = this.getFullKey(key);
      await this.redis.del(fullKey);
      this.logger.debug(`缓存删除成功: ${this.keyPrefix}${fullKey}`);
    } catch (error) {
      this.logger.error(`删除缓存失败 [${key}]: ${error.message}`, error.stack);
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `检查缓存存在性失败 [${key}]: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * 获取缓存TTL
   * @param key 缓存键
   * @returns TTL（秒）
   */
  async getTtl(key: string): Promise<number> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      return -1;
    }

    try {
      const fullKey = this.getFullKey(key);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error(
        `获取缓存TTL失败 [${key}]: ${error.message}`,
        error.stack,
      );
      return -1;
    }
  }

  /**
   * 设置缓存过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<void> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      this.logger.warn(`Redis不可用，跳过设置过期时间: ${key}`);
      return;
    }

    try {
      const fullKey = this.getFullKey(key);
      await this.redis.expire(fullKey, ttl);
      this.logger.debug(
        `缓存过期时间设置成功: ${this.keyPrefix}${fullKey}, TTL: ${ttl}s`,
      );
    } catch (error) {
      this.logger.error(
        `设置缓存过期时间失败 [${key}]: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 根据模式删除缓存
   * @param pattern 匹配模式
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      this.logger.warn(`Redis不可用，跳过模式删除: ${pattern}`);
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`批量删除缓存成功: ${keys.length} 个键`);
      }
    } catch (error) {
      this.logger.error(
        `批量删除缓存失败 [${pattern}]: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      this.logger.warn('Redis不可用，跳过清空缓存');
      return;
    }

    try {
      await this.redis.flushdb();
      this.logger.debug('所有缓存已清空');
    } catch (error) {
      this.logger.error(`清空缓存失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 获取缓存数据，如果不存在则通过工厂函数获取并缓存
   * @param key 缓存键
   * @param factory 工厂函数，用于获取数据
   * @param ttl 过期时间（秒）
   * @returns 缓存数据
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    try {
      this.logger.debug(`缓存未命中，执行工厂函数: ${key}`);
      const value = await factory();

      // 只有在Redis可用时才设置缓存
      if (this.redisEnabled && this.isRedisAvailable()) {
        await this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      this.logger.error(
        `获取或设置缓存失败 [${key}]: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  async getStats(): Promise<any> {
    if (!this.redisEnabled) {
      return {
        provider: 'disabled',
        status: 'Redis已禁用',
        keyPrefix: this.keyPrefix,
        defaultTtl: this.defaultTtl,
      };
    }

    if (!this.isRedisAvailable()) {
      return {
        provider: 'ioredis',
        status: 'Redis不可用',
        keyPrefix: this.keyPrefix,
        defaultTtl: this.defaultTtl,
      };
    }

    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');

      return {
        provider: 'ioredis',
        status: 'connected',
        memory: info,
        keyspace: keyspace,
        connected: this.redis.status === 'ready',
        uptime: await this.redis.lastsave(),
        keyPrefix: this.keyPrefix,
        defaultTtl: this.defaultTtl,
      };
    } catch (error) {
      this.logger.error(`获取缓存统计失败: ${error.message}`, error.stack);
      return {
        provider: 'ioredis',
        status: 'error',
        error: error.message,
        keyPrefix: this.keyPrefix,
        defaultTtl: this.defaultTtl,
      };
    }
  }

  /**
   * 获取所有匹配的键
   * @param pattern 匹配模式
   * @returns 键列表
   */
  async getKeys(pattern: string = '*'): Promise<string[]> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      return [];
    }

    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(
        `获取键列表失败 [${pattern}]: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * 批量获取缓存数据
   * @param keys 缓存键数组
   * @returns 缓存数据数组
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      return keys.map(() => null);
    }

    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      const values = await this.redis.mget(...fullKeys);

      return values.map((value) => {
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      this.logger.error(`批量获取缓存失败: ${error.message}`, error.stack);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置缓存数据
   * @param data 键值对数组
   * @param ttl 过期时间（秒）
   */
  async mset(
    data: Array<{ key: string; value: any }>,
    ttl?: number,
  ): Promise<void> {
    if (!this.redisEnabled || !this.isRedisAvailable()) {
      this.logger.warn('Redis不可用，跳过批量设置缓存');
      return;
    }

    try {
      const pipeline = this.redis.pipeline();

      data.forEach(({ key, value }) => {
        const fullKey = this.getFullKey(key);
        const serializedValue = JSON.stringify(value);

        if (ttl) {
          pipeline.setex(fullKey, ttl, serializedValue);
        } else {
          pipeline.set(fullKey, serializedValue);
        }
      });

      await pipeline.exec();
      this.logger.debug(`批量设置缓存成功: ${data.length} 个键`);
    } catch (error) {
      this.logger.error(`批量设置缓存失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 获取Redis启用状态
   * @returns 是否启用Redis
   */
  isEnabled(): boolean {
    return this.redisEnabled;
  }

  /**
   * 获取Redis连接状态
   * @returns 连接状态
   */
  getConnectionStatus(): string {
    if (!this.redisEnabled) {
      return 'disabled';
    }
    if (!this.redis) {
      return 'not_initialized';
    }
    return this.redis.status;
  }
}
