import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigEnum } from '../enum/config.enum';
import { getEnv } from './common';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseConfig');

/**
 * 构建TypeORM连接配置
 * 根据环境变量配置数据库连接参数
 * @returns TypeORM模块配置选项
 */
export function buildConnectionOptions(): TypeOrmModuleOptions {
  // 加载配置文件
  const nodeEnv = process.env.NODE_ENV || 'development';
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${nodeEnv}`);
  const config = { ...defaultConfig, ...envConfig };

  // 是否启用日志
  const logFlag = config['LOG_ON'] === 'true';

  logger.log(`Database configuration loaded for ${nodeEnv} environment`);

  // 构建数据库连接配置
  const options: TypeOrmModuleOptions = {
    type: config[ConfigEnum.DB_TYPE] as any,
    host: config[ConfigEnum.DB_HOST] as string,
    port: Number(config[ConfigEnum.DB_PORT]),
    username: config[ConfigEnum.DB_USERNAME] as string,
    password: config[ConfigEnum.DB_PASSWORD] as string,
    database: config[ConfigEnum.DB_DATABASE] as string,
    autoLoadEntities: true, // 自动加载实体
    synchronize: nodeEnv === 'development', // 仅在开发环境下同步数据库结构
    logging: logFlag && nodeEnv === 'development',
    // 添加连接池配置，提高性能
    poolSize: 10,
    connectTimeout: 20000,
  };

  return options;
}

// 导出连接参数
export const connectionParams = buildConnectionOptions();

/**
 * 用于迁移的数据源配置
 * 取消注释以启用数据库迁移功能
 */
/*
import { DataSource, DataSourceOptions } from 'typeorm';

export default new DataSource({
  ...connectionParams,
  migrations: ['src/migrations/**'],
  subscribers: [],
} as DataSourceOptions);
*/
