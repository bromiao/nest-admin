import { Injectable, Logger } from '@nestjs/common';
import { OrmFactoryService } from '../orm/orm-factory.service';
import { BookService } from './book.service';
import { BookPrismaService } from './book-prisma.service';
import { Book } from './book.entity';
import { Book as PrismaBook } from '@prisma/client';

/**
 * 书籍适配器服务
 * 根据ORM类型选择相应的服务实现
 */
@Injectable()
export class BookAdapterService {
  private readonly logger = new Logger(BookAdapterService.name);

  constructor(
    private ormFactory: OrmFactoryService,
    private bookService: BookService,
    private bookPrismaService: BookPrismaService,
  ) {}

  /**
   * 创建书籍
   */
  async create(bookData: Partial<Book>): Promise<Book | PrismaBook> {
    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData = {
        ...bookData,
        createDatetime: bookData.createDatetime
          ? BigInt(bookData.createDatetime)
          : BigInt(Date.now()),
        updateDatetime: bookData.updateDatetime
          ? BigInt(bookData.updateDatetime)
          : BigInt(Date.now()),
      };
      return await this.bookPrismaService.create(prismaData);
    }
    return await this.bookService.create(bookData);
  }

  /**
   * 查找所有书籍
   */
  async findAll(): Promise<(Book | PrismaBook)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.findAll();
    }
    return await this.bookService.findAll();
  }

  /**
   * 根据ID查找书籍
   */
  async findOne(id: number): Promise<Book | PrismaBook> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.findOne(id);
    }
    return await this.bookService.findOne(id);
  }

  /**
   * 根据文件名查找书籍
   */
  async findByFileName(fileName: string): Promise<Book | PrismaBook | null> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.findByFileName(fileName);
    }
    return await this.bookService.findByFileName(fileName);
  }

  /**
   * 更新书籍
   */
  async update(
    id: number,
    updateData: Partial<Book>,
  ): Promise<Book | PrismaBook> {
    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData = {
        ...updateData,
        createDatetime: updateData.createDatetime
          ? BigInt(updateData.createDatetime)
          : undefined,
        updateDatetime: updateData.updateDatetime
          ? BigInt(updateData.updateDatetime)
          : BigInt(Date.now()),
      };
      return await this.bookPrismaService.update(id, prismaData);
    }
    return await this.bookService.update(id, updateData);
  }

  /**
   * 删除书籍
   */
  async remove(id: number): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.remove(id);
    }
    await this.bookService.remove(id);
  }

  /**
   * 获取书籍总数
   */
  async count(): Promise<number> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.count();
    }
    return await this.bookService.count();
  }

  /**
   * 分页查询书籍
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: (Book | PrismaBook)[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.findWithPagination(page, limit);
    }
    return await this.bookService.findWithPagination(page, limit);
  }

  /**
   * 根据分类查找书籍
   */
  async findByCategory(category: number): Promise<(Book | PrismaBook)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.findByCategory(category);
    }
    return await this.bookService.findByCategory(category);
  }

  /**
   * 搜索书籍
   */
  async search(keyword: string): Promise<(Book | PrismaBook)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.search(keyword);
    }
    return await this.bookService.search(keyword);
  }

  /**
   * 批量删除书籍
   */
  async removeMany(ids: number[]): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.bookPrismaService.removeMany(ids);
    }
    await this.bookService.removeMany(ids);
  }

  /**
   * 获取当前使用的ORM信息
   */
  getOrmInfo() {
    return this.ormFactory.getOrmInfo();
  }
}
