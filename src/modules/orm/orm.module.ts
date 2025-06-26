import { Module, Global } from '@nestjs/common';
import { OrmFactoryService } from './orm-factory.service';

/**
 * ORM模块
 * 全局模块，提供ORM工厂服务
 */
@Global()
@Module({
  providers: [OrmFactoryService],
  exports: [OrmFactoryService],
})
export class OrmModule {}
