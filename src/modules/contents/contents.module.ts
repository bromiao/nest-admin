import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contents } from './contents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contents])],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
