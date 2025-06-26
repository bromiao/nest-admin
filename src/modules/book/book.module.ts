import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookPrismaService } from './book-prisma.service';
import { BookAdapterService } from './book-adapter.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { PrismaModule } from '../prisma/prisma.module';
import { OrmModule } from '../orm/orm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), PrismaModule, OrmModule],
  controllers: [BookController],
  providers: [BookService, BookPrismaService, BookAdapterService],
  exports: [BookService, BookPrismaService, BookAdapterService],
})
export class BookModule {}
