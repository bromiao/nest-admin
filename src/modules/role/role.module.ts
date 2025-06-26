import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { RolePrismaService } from './role-prisma.service';
import { RoleAdapterService } from './role-adapter.service';
import { RoleController } from './role.controller';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';
import { OrmModule } from '../orm/orm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    CacheModule,
    LoggerModule,
    OrmModule,
    PrismaModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, RolePrismaService, RoleAdapterService],
  exports: [RoleService, RolePrismaService, RoleAdapterService],
})
export class RoleModule {}
