import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuPrismaService } from './menu-prisma.service';
import { MenuAdapterService } from './menu-adapter.service';
import { Menu } from './menu.entity';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';
import { OrmModule } from '../orm/orm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]),
    CacheModule,
    LoggerModule,
    OrmModule,
    PrismaModule,
  ],
  controllers: [MenuController],
  providers: [MenuService, MenuPrismaService, MenuAdapterService],
  exports: [MenuService, MenuPrismaService, MenuAdapterService],
})
export class MenuModule {}
