import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

const logger = new Logger('RedisConfig');

/**
 * Redis配置接口
 */
export interface RedisConfig {
  enabled: boolean;
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
  keyPrefix: string;
  reconnect?: boolean;
}

/**
 * 获取Redis配置
 * @param configService 配置服务
 * @returns Redis配置对象
 */
export function getRedisConfig(configService?: ConfigService): RedisConfig {
  // 如果没有提供configService，则直接从环境变量读取
  const getEnvValue = (key: string, defaultValue: string): string => {
    if (configService) {
      // 先尝试从自定义配置中获取
      const appConfig = configService.get('app');
      if (appConfig && appConfig[key]) {
        return appConfig[key];
      }
      // 如果自定义配置中没有，则从标准配置中获取
      return configService.get<string>(key) || defaultValue;
    }
    return process.env[key] || defaultValue;
  };

  const config: RedisConfig = {
    enabled: getEnvValue('REDIS_ENABLED', 'false') === 'true',
    host: getEnvValue('REDIS_HOST', 'localhost'),
    port: parseInt(getEnvValue('REDIS_PORT', '6379'), 10),
    password: getEnvValue('REDIS_PASSWORD', 'example'),
    db: parseInt(getEnvValue('REDIS_DB', '1'), 10),
    ttl: parseInt(getEnvValue('REDIS_TTL', '300'), 10),
    keyPrefix: getEnvValue('REDIS_KEY_PREFIX', 'nest-admin-dev:'),
    reconnect: getEnvValue('REDIS_RECONNECT', 'true') === 'true',
  };

  if (config.enabled) {
    logger.log(
      `Redis配置加载完成: ${config.host}:${config.port}, DB: ${config.db}`,
    );
  } else {
    logger.warn('Redis已禁用，缓存功能将不可用');
  }

  return config;
}

/**
 * 检查Redis是否启用
 * @param configService 配置服务
 * @returns 是否启用Redis
 */
export function isRedisEnabled(configService?: ConfigService): boolean {
  const config = getRedisConfig(configService);
  return config.enabled;
}

/**
 * 创建IORedis配置选项
 * @param redisConfig Redis配置
 * @returns IORedis配置选项
 */
export function createIORedisOptions(redisConfig: RedisConfig): RedisOptions {
  return {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db,
    keyPrefix: redisConfig.keyPrefix,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    lazyConnect: false,
    // 连接池配置
    family: 4,
    keepAlive: 30000, // 30秒
    // 重连配置
    enableOfflineQueue: true,
    // 日志配置
    showFriendlyErrorStack: true,
    // 连接超时
    connectTimeout: 10000,
    commandTimeout: 5000,
  };
}

/**
 * 创建Redis连接选项（用于cache-manager）
 * @param redisConfig Redis配置
 * @returns Redis连接选项
 */
export function createRedisOptions(redisConfig: RedisConfig) {
  const options = {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db,
    ttl: redisConfig.ttl,
    keyPrefix: redisConfig.keyPrefix,
    // 连接选项
    connectTimeout: 10000,
    commandTimeout: 5000,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // 错误处理
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis重连尝试 ${times}, 延迟 ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      logger.error(`Redis连接错误: ${err.message}`);
      const targetError = 'READONLY';
      return err.message.includes(targetError);
    },
  };

  logger.debug('Redis连接选项创建完成', undefined, options);
  return options;
}
