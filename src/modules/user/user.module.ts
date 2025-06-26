import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserPrismaService } from './user-prisma.service';
import { UserAdapterService } from './user-adapter.service';
import { UserController } from './user.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrmModule } from '../orm/orm.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PrismaModule, OrmModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserPrismaService,
    UserAdapterService,
    LoggerService,
  ],
  exports: [UserService, UserPrismaService, UserAdapterService],
})
export class UserModule {}
