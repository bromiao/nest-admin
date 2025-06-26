import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

/**
 * Prisma服务
 * 管理Prisma客户端的生命周期和连接
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DB_URL'),
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  /**
   * 模块初始化时连接数据库
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database with Prisma', error);
      throw error;
    }
  }

  /**
   * 模块销毁时断开数据库连接
   */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  /**
   * 清理数据库连接（用于测试）
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      // 在测试环境中清理数据库
      const tablenames = await this.$queryRaw<Array<{ TABLE_NAME: string }>>`
        SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'your_test_database';
      `;

      const tables = tablenames
        .map(({ TABLE_NAME }) => TABLE_NAME)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `\`${name}\``)
        .join(', ');

      try {
        await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables}`);
      } catch (error) {
        this.logger.error('Error cleaning database', error);
      }
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
