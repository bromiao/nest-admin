import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

const logger = new Logger('ConfigService');

/**
 * 读取指定环境变量文件并解析其内容
 * @param env 环境变量文件路径
 * @returns 解析后的环境变量对象
 */
export function getEnv(env: string): Record<string, unknown> {
  try {
    if (fs.existsSync(env)) {
      logger.debug(`Loading config from ${env}`);
      return dotenv.parse(fs.readFileSync(env));
    }
    logger.warn(`Config file ${env} not found`);
    return {};
  } catch (error) {
    logger.error(`Error loading config from ${env}`, error);
    return {};
  }
}

/**
 * 获取服务器配置
 * 合并默认配置和当前环境特定配置
 * @returns 合并后的配置对象
 */
export function getServerConfig(): Record<string, unknown> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${nodeEnv}`);

  logger.log(`Application running in ${nodeEnv} mode`);

  // 合并配置，环境特定配置优先级高于默认配置
  return { ...defaultConfig, ...envConfig };
}
