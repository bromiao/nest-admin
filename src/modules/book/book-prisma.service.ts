import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Book } from '@prisma/client';

/**
 * 书籍服务 - Prisma版本
 * 使用Prisma ORM进行数据库操作
 */
@Injectable()
export class BookPrismaService {
  private readonly logger = new Logger(BookPrismaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建书籍
   */
  async create(bookData: Partial<Book>): Promise<Book> {
    try {
      const book = await this.prisma.book.create({
        data: {
          ...bookData,
          createDatetime: BigInt(Date.now()),
          updateDatetime: BigInt(Date.now()),
        } as any,
      });

      this.logger.log(`Book created with ID: ${book.id}`);
      return book;
    } catch (error) {
      this.logger.error('Error creating book', error);
      throw error;
    }
  }

  /**
   * 查找所有书籍
   */
  async findAll(): Promise<Book[]> {
    try {
      return await this.prisma.book.findMany({
        orderBy: { id: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error finding all books', error);
      throw error;
    }
  }

  /**
   * 根据ID查找书籍
   */
  async findOne(id: number): Promise<Book> {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id },
      });

      if (!book) {
        throw new NotFoundException(`书籍ID ${id} 不存在`);
      }

      return book;
    } catch (error) {
      this.logger.error(`Error finding book with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * 根据文件名查找书籍
   */
  async findByFileName(fileName: string): Promise<Book | null> {
    try {
      return await this.prisma.book.findFirst({
        where: { fileName },
      });
    } catch (error) {
      this.logger.error(`Error finding book with fileName ${fileName}`, error);
      throw error;
    }
  }

  /**
   * 更新书籍
   */
  async update(id: number, updateData: Partial<Book>): Promise<Book> {
    try {
      // 检查书籍是否存在
      await this.findOne(id);

      const book = await this.prisma.book.update({
        where: { id },
        data: {
          ...updateData,
          updateDatetime: BigInt(Date.now()),
        } as any,
      });

      this.logger.log(`Book updated with ID: ${id}`);
      return book;
    } catch (error) {
      this.logger.error(`Error updating book with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * 删除书籍
   */
  async remove(id: number): Promise<void> {
    try {
      // 检查书籍是否存在
      await this.findOne(id);

      await this.prisma.book.delete({
        where: { id },
      });

      this.logger.log(`Book deleted with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting book with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * 获取书籍总数
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.book.count();
    } catch (error) {
      this.logger.error('Error counting books', error);
      throw error;
    }
  }

  /**
   * 分页查询书籍
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.book.findMany({
          skip,
          take: limit,
          orderBy: { id: 'desc' },
        }),
        this.prisma.book.count(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error finding books with pagination', error);
      throw error;
    }
  }

  /**
   * 根据分类查找书籍
   */
  async findByCategory(category: number): Promise<Book[]> {
    try {
      return await this.prisma.book.findMany({
        where: { category },
        orderBy: { id: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error finding books with category ${category}`, error);
      throw error;
    }
  }

  /**
   * 搜索书籍
   */
  async search(keyword: string): Promise<Book[]> {
    try {
      return await this.prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: keyword } },
            { author: { contains: keyword } },
            { publisher: { contains: keyword } },
          ],
        },
        orderBy: { id: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error searching books with keyword ${keyword}`, error);
      throw error;
    }
  }

  /**
   * 批量删除书籍
   */
  async removeMany(ids: number[]): Promise<void> {
    try {
      await this.prisma.book.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      this.logger.log(`Books deleted with IDs: ${ids.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `Error deleting books with IDs ${ids.join(', ')}`,
        error,
      );
      throw error;
    }
  }
}
