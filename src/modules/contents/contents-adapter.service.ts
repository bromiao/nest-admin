import { Injectable, Logger } from '@nestjs/common';
import { OrmFactoryService } from '../orm/orm-factory.service';
import { ContentsService } from './contents.service';
import { ContentsPrismaService } from './contents-prisma.service';
import { Contents } from './contents.entity';
import { Contents as PrismaContents } from '@prisma/client';

/**
 * 内容适配器服务
 * 根据ORM类型选择相应的服务实现
 */
@Injectable()
export class ContentsAdapterService {
  private readonly logger = new Logger(ContentsAdapterService.name);

  constructor(
    private ormFactory: OrmFactoryService,
    private contentsService: ContentsService,
    private contentsPrismaService: ContentsPrismaService,
  ) {}

  /**
   * 创建内容
   */
  async create(contentsData: any): Promise<Contents | PrismaContents> {
    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData = {
        fileName: contentsData.fileName || '',
        id: contentsData.id || '',
        href: contentsData.href,
        order: this.convertToInt(contentsData.order),
        level: this.convertToInt(contentsData.level),
        text: contentsData.text,
        label: contentsData.label,
        pid: contentsData.pid,
        navId: contentsData.navId || '',
      };
      return await this.contentsPrismaService.create(prismaData);
    }
    return await this.contentsService.create(contentsData);
  }

  /**
   * 查找所有内容
   */
  async findAll(): Promise<(Contents | PrismaContents)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.findAll();
    }
    return await this.contentsService.findAll();
  }

  /**
   * 根据ID查找内容
   */
  async findOne(id: any): Promise<Contents | PrismaContents> {
    if (this.ormFactory.isPrisma()) {
      // Prisma 使用复合主键，需要 fileName 和 navId
      if (typeof id === 'object' && id.fileName && id.navId) {
        return await this.contentsPrismaService.findOne(id.fileName, id.navId);
      }
      // 如果只有一个参数，尝试解析
      const parts = String(id).split(':');
      if (parts.length === 2) {
        return await this.contentsPrismaService.findOne(parts[0], parts[1]);
      }
      throw new Error('Prisma Contents requires fileName and navId');
    }
    return await this.contentsService.findOne(id);
  }

  /**
   * 更新内容
   */
  async update(id: any, updateData: any): Promise<Contents | PrismaContents> {
    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaUpdateData = { ...updateData };
      if (prismaUpdateData.order !== undefined) {
        prismaUpdateData.order = this.convertToInt(prismaUpdateData.order);
      }
      if (prismaUpdateData.level !== undefined) {
        prismaUpdateData.level = this.convertToInt(prismaUpdateData.level);
      }

      // Prisma 使用复合主键
      if (typeof id === 'object' && id.fileName && id.navId) {
        return await this.contentsPrismaService.update(
          id.fileName,
          id.navId,
          prismaUpdateData,
        );
      }
      const parts = String(id).split(':');
      if (parts.length === 2) {
        return await this.contentsPrismaService.update(
          parts[0],
          parts[1],
          prismaUpdateData,
        );
      }
      throw new Error('Prisma Contents requires fileName and navId');
    }
    return await this.contentsService.update(id, updateData);
  }

  /**
   * 删除内容
   */
  async remove(id: any): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      // Prisma 使用复合主键
      if (typeof id === 'object' && id.fileName && id.navId) {
        return await this.contentsPrismaService.remove(id.fileName, id.navId);
      }
      const parts = String(id).split(':');
      if (parts.length === 2) {
        return await this.contentsPrismaService.remove(parts[0], parts[1]);
      }
      throw new Error('Prisma Contents requires fileName and navId');
    }
    await this.contentsService.remove(id);
  }

  /**
   * 获取内容总数
   */
  async count(): Promise<number> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.count();
    }
    return await this.contentsService.count();
  }

  /**
   * 分页查询内容
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: (Contents | PrismaContents)[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.findWithPagination(page, limit);
    }
    return await this.contentsService.findWithPagination(page, limit);
  }

  /**
   * 搜索内容
   */
  async search(keyword: string): Promise<(Contents | PrismaContents)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.search(keyword);
    }
    return await this.contentsService.search(keyword);
  }

  /**
   * 批量删除内容
   */
  async removeMany(ids: any[]): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      // 对于 Prisma，假设 ids 是 fileName 数组
      return await this.contentsPrismaService.removeMany(ids);
    }
    await this.contentsService.removeMany(ids);
  }

  // 兼容现有接口的方法

  /**
   * 获取内容列表
   */
  async getContentsList(params: any): Promise<(Contents | PrismaContents)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.getContentsList(params);
    }
    return await this.contentsService.getContentsList(params);
  }

  /**
   * 统计内容数量
   */
  async countContentsList(params: any): Promise<number> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.countContentsList(params);
    }
    return await this.contentsService.countContentsList(params);
  }

  /**
   * 添加内容
   */
  async addContents(params: any): Promise<Contents | PrismaContents> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.addContents(params);
    }
    return await this.contentsService.addContents(params);
  }

  /**
   * 删除内容
   */
  async deleteContents(fileName: string): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.contentsPrismaService.deleteContents(fileName);
    }
    return await this.contentsService.deleteContents(fileName);
  }

  /**
   * 获取当前使用的ORM信息
   */
  getOrmInfo() {
    return this.ormFactory.getOrmInfo();
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
