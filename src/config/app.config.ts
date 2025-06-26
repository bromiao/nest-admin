import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export default registerAs('app', () => {
  // 手动加载环境文件，确保正确的优先级
  const envPath = path.resolve(process.cwd(), '.env');
  const envDevPath = path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  );

  let config = {};

  // 先加载基础配置
  if (fs.existsSync(envPath)) {
    const baseConfig = dotenv.parse(fs.readFileSync(envPath));
    config = { ...config, ...baseConfig };
  }

  // 再加载环境特定配置（会覆盖基础配置）
  if (fs.existsSync(envDevPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envDevPath));
    config = { ...config, ...envConfig };
  }

  console.log('手动加载的Redis配置:', {
    REDIS_ENABLED: config['REDIS_ENABLED'],
    REDIS_HOST: config['REDIS_HOST'],
    REDIS_PORT: config['REDIS_PORT'],
    REDIS_DB: config['REDIS_DB'],
  });

  return config;
});
