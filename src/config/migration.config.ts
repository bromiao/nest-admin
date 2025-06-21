import { Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { ConfigEnum } from '../enum/config.enum';
import { getEnv } from '../utils/common';
import * as path from 'path';

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
    synchronize: false, // 生产环境禁用自动同步，使用迁移管理数据库结构
    logging: logFlag && nodeEnv === 'development',
    // 添加连接池配置，提高性能
    poolSize: 10,
    connectTimeout: 20000,
    // 实体路径配置
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  };

  return options;
}

// 导出连接参数
export const connectionParams = buildConnectionOptions();

/**
 * 获取迁移配置
 * 用于TypeORM CLI和迁移脚本
 */
export function getMigrationConfig(): MysqlConnectionOptions {
  // 加载配置文件
  const nodeEnv = process.env.NODE_ENV || 'development';
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${nodeEnv}`);
  const config = { ...defaultConfig, ...envConfig };

  // 是否启用日志
  const logFlag = config['LOG_ON'] === 'true';

  const migrationConfig: MysqlConnectionOptions = {
    type: 'mysql',
    host: config[ConfigEnum.DB_HOST] as string,
    port: Number(config[ConfigEnum.DB_PORT]),
    username: config[ConfigEnum.DB_USERNAME] as string,
    password: config[ConfigEnum.DB_PASSWORD] as string,
    database: config[ConfigEnum.DB_DATABASE] as string,
    logging: logFlag && nodeEnv === 'development',
    // 迁移文件路径
    migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
    // 迁移文件输出目录
    migrationsTableName: 'migrations',
    // 实体文件路径
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    // 订阅者路径
    subscribers: [path.join(__dirname, '../database/subscribers/*{.ts,.js}')],
  };

  return migrationConfig;
}

/**
 * 数据库迁移功能——用于迁移的数据源配置
 */
const migrationDataSource = new DataSource(getMigrationConfig());

export default migrationDataSource;
