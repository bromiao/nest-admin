import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsService } from './contents.service';
import { ContentsPrismaService } from './contents-prisma.service';
import { ContentsAdapterService } from './contents-adapter.service';
import { ContentsController } from './contents.controller';
import { Contents } from './contents.entity';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';
import { OrmModule } from '../orm/orm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contents]),
    CacheModule,
    LoggerModule,
    OrmModule,
    PrismaModule,
  ],
  controllers: [ContentsController],
  providers: [ContentsService, ContentsPrismaService, ContentsAdapterService],
  exports: [ContentsService, ContentsPrismaService, ContentsAdapterService],
})
export class ContentsModule {}
