import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigEnum } from '../enum/config.enum';
import { getEnv } from './common';

// 通过dotENV来解析不同的配置
export function buildConnectionOptions(): TypeOrmModuleOptions {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`);
  // configService
  const config = { ...defaultConfig, ...envConfig };

  const logFlag = config['LOG_ON'] === 'true';

  // const entitiesDir =
  //   process.env.NODE_ENV === 'test'
  //     ? [__dirname + '/**/*.entity.ts']
  //     : [__dirname + '/**/*.entity{.js,.ts}'];
  const entitiesDir = ['../modules/**/*.entity{.js,.ts}'];

  console.log('Entities Directory:', entitiesDir);

  return {
    type: config[ConfigEnum.DB_TYPE],
    host: config[ConfigEnum.DB_HOST],
    port: config[ConfigEnum.DB_PORT],
    username: config[ConfigEnum.DB_USERNAME],
    password: config[ConfigEnum.DB_PASSWORD],
    database: config[ConfigEnum.DB_DATABASE],
    // entities: entitiesDir,
    autoLoadEntities: true, // 自动加载实体
    // 同步本地的schema与数据库 -> 初始化的时候去使用
    // synchronize: true,
    // 数据库相关日志，如数据库操作的sql语句等
    logging: logFlag && process.env.NODE_ENV === 'development',
    // logging: false,
  } as TypeOrmModuleOptions;
}

export const connectionParams = buildConnectionOptions();

// export default new DataSource({
//   ...connectionParams,
//   migrations: ['src/migrations/**'],
//   subscribers: [],
// } as DataSourceOptions);
