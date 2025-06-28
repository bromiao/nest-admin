import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Contents } from '@prisma/client';

/**
 * 内容服务 - Prisma版本
 * 使用Prisma ORM进行数据库操作
 */
@Injectable()
export class ContentsPrismaService {
  private readonly logger = new Logger(ContentsPrismaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建内容
   */
  async create(contentsData: Omit<Contents, never>): Promise<Contents> {
    try {
      // 转换数据类型以适配Prisma
      const prismaData = {
        ...contentsData,
        order: this.convertToInt(contentsData.order),
        level: this.convertToInt(contentsData.level),
      };

      const contents = await this.prisma.contents.create({
        data: prismaData,
      });
      this.logger.log(`创建内容成功: ${contents.fileName}`);
      return contents;
    } catch (error) {
      this.logger.error(`创建内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 查找所有内容
   */
  async findAll(): Promise<Contents[]> {
    try {
      return await this.prisma.contents.findMany({
        orderBy: { fileName: 'asc' },
      });
    } catch (error) {
      this.logger.error(`查询所有内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据fileName和navId查找内容
   */
  async findOne(fileName: string, navId: string): Promise<Contents> {
    try {
      const contents = await this.prisma.contents.findUnique({
        where: {
          fileName_navId: {
            fileName,
            navId,
          },
        },
      });

      if (!contents) {
        throw new NotFoundException(`内容 ${fileName}:${navId} 不存在`);
      }

      return contents;
    } catch (error) {
      this.logger.error(`查询内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据fileName查找内容
   */
  async findByFileName(fileName: string): Promise<Contents[]> {
    try {
      return await this.prisma.contents.findMany({
        where: { fileName },
        orderBy: { order: 'asc' },
      });
    } catch (error) {
      this.logger.error(`根据文件名查询内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新内容
   */
  async update(
    fileName: string,
    navId: string,
    updateData: Partial<Omit<Contents, 'fileName' | 'navId'>>,
  ): Promise<Contents> {
    try {
      // 转换数据类型以适配Prisma
      const prismaUpdateData = { ...updateData };
      if (prismaUpdateData.order !== undefined) {
        prismaUpdateData.order = this.convertToInt(prismaUpdateData.order);
      }
      if (prismaUpdateData.level !== undefined) {
        prismaUpdateData.level = this.convertToInt(prismaUpdateData.level);
      }

      const contents = await this.prisma.contents.update({
        where: {
          fileName_navId: {
            fileName,
            navId,
          },
        },
        data: prismaUpdateData,
      });
      this.logger.log(`更新内容成功: ${contents.fileName}`);
      return contents;
    } catch (error) {
      this.logger.error(`更新内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除内容
   */
  async remove(fileName: string, navId: string): Promise<void> {
    try {
      await this.prisma.contents.delete({
        where: {
          fileName_navId: {
            fileName,
            navId,
          },
        },
      });
      this.logger.log(`删除内容成功: ${fileName}:${navId}`);
    } catch (error) {
      this.logger.error(`删除内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据fileName删除所有相关内容
   */
  async removeByFileName(fileName: string): Promise<void> {
    try {
      await this.prisma.contents.deleteMany({
        where: { fileName },
      });
      this.logger.log(`删除文件内容成功: ${fileName}`);
    } catch (error) {
      this.logger.error(`删除文件内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取内容总数
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.contents.count();
    } catch (error) {
      this.logger.error(`获取内容总数失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分页查询内容
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Contents[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.prisma.contents.findMany({
          skip,
          take: limit,
          orderBy: { fileName: 'asc' },
        }),
        this.prisma.contents.count(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`分页查询内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 搜索内容
   */
  async search(keyword: string): Promise<Contents[]> {
    try {
      return await this.prisma.contents.findMany({
        where: {
          OR: [
            { fileName: { contains: keyword } },
            { text: { contains: keyword } },
            { label: { contains: keyword } },
          ],
        },
        orderBy: { fileName: 'asc' },
      });
    } catch (error) {
      this.logger.error(`搜索内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量删除内容
   */
  async removeMany(fileNames: string[]): Promise<void> {
    try {
      await this.prisma.contents.deleteMany({
        where: {
          fileName: { in: fileNames },
        },
      });
      this.logger.log(`批量删除内容成功: ${fileNames.join(', ')}`);
    } catch (error) {
      this.logger.error(`批量删除内容失败: ${error.message}`);
      throw error;
    }
  }

  // 兼容现有接口的方法

  /**
   * 获取内容列表（兼容现有接口）
   */
  async getContentsList(params: any): Promise<Contents[]> {
    try {
      const where: any = {};
      if (params.fileName) {
        where.fileName = { contains: params.fileName };
      }
      if (params.author) {
        where.label = { contains: params.author };
      }

      return await this.prisma.contents.findMany({
        where,
        orderBy: { fileName: 'asc' },
      });
    } catch (error) {
      this.logger.error(`获取内容列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 统计内容数量（兼容现有接口）
   */
  async countContentsList(params: any): Promise<number> {
    try {
      const where: any = {};
      if (params.fileName) {
        where.fileName = { contains: params.fileName };
      }
      if (params.author) {
        where.label = { contains: params.author };
      }

      return await this.prisma.contents.count({ where });
    } catch (error) {
      this.logger.error(`统计内容数量失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加内容（兼容现有接口）
   */
  async addContents(params: any): Promise<Contents> {
    // 转换数据类型以适配Prisma
    const prismaData = {
      ...params,
      order: this.convertToInt(params.order),
      level: this.convertToInt(params.level),
    };
    return this.create(prismaData);
  }

  /**
   * 删除内容（兼容现有接口）
   */
  async deleteContents(fileName: string): Promise<void> {
    return this.removeByFileName(fileName);
  }

  /**
   * 将字符串或数字转换为整数，处理null和undefined
   */
  private convertToInt(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = parseInt(String(value), 10);
    return isNaN(num) ? null : num;
  }
}
