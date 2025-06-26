import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contents } from './contents.entity';

@Injectable()
export class ContentsService {
  private readonly logger = new Logger(ContentsService.name);

  constructor(
    @InjectRepository(Contents)
    private readonly contentsRepository: Repository<Contents>,
  ) {}

  /**
   * 创建内容
   */
  async create(contentsData: any): Promise<Contents> {
    try {
      const contents = this.contentsRepository.create(contentsData);
      const savedContents = await this.contentsRepository.save(contents);
      // 确保 savedContents 是单个对象而不是数组
      const result = Array.isArray(savedContents)
        ? savedContents[0]
        : savedContents;
      this.logger.log(`创建内容成功: ${result.fileName}`);
      return result;
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
      return await this.contentsRepository.find({
        order: { fileName: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`查询所有内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID查找内容
   */
  async findOne(id: any): Promise<Contents> {
    try {
      const contents = await this.contentsRepository.findOne({ where: { id } });
      if (!contents) {
        throw new Error(`内容 ID ${id} 不存在`);
      }
      return contents;
    } catch (error) {
      this.logger.error(`查询内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新内容
   */
  async update(id: any, updateData: any): Promise<Contents> {
    try {
      await this.contentsRepository.update(id, updateData);
      const updatedContents = await this.findOne(id);
      this.logger.log(`更新内容成功: ${updatedContents.fileName}`);
      return updatedContents;
    } catch (error) {
      this.logger.error(`更新内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除内容
   */
  async remove(id: any): Promise<void> {
    try {
      await this.contentsRepository.delete(id);
      this.logger.log(`删除内容成功: ID ${id}`);
    } catch (error) {
      this.logger.error(`删除内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取内容总数
   */
  async count(): Promise<number> {
    try {
      return await this.contentsRepository.count();
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
        this.contentsRepository.find({
          skip,
          take: limit,
          order: { fileName: 'ASC' },
        }),
        this.contentsRepository.count(),
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
      return await this.contentsRepository
        .createQueryBuilder('contents')
        .where('contents.fileName LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('contents.text LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('contents.label LIKE :keyword', { keyword: `%${keyword}%` })
        .orderBy('contents.fileName', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`搜索内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量删除内容
   */
  async removeMany(ids: any[]): Promise<void> {
    try {
      await this.contentsRepository.delete(ids);
      this.logger.log(`批量删除内容成功: ${ids.join(', ')}`);
    } catch (error) {
      this.logger.error(`批量删除内容失败: ${error.message}`);
      throw error;
    }
  }

  // 兼容现有接口的方法

  /**
   * 获取内容列表
   */
  async getContentsList(params: any): Promise<Contents[]> {
    const whereConditions: any = {};

    if (params.fileName) {
      whereConditions.fileName = Like(`%${params.fileName}%`);
    }

    if (params.author) {
      whereConditions.label = Like(`%${params.author}%`);
    }

    // 根据是否有查询条件决定查询方式
    if (Object.keys(whereConditions).length > 0) {
      return await this.contentsRepository.find({ where: whereConditions });
    } else {
      return await this.contentsRepository.find(); // 不传where参数
    }
  }

  /**
   * 统计内容数量
   */
  async countContentsList(params: any): Promise<number> {
    const whereConditions: any = {};

    if (params.fileName) {
      whereConditions.fileName = Like(`%${params.fileName}%`);
    }

    if (params.author) {
      whereConditions.label = Like(`%${params.author}%`);
    }

    // 根据是否有查询条件决定查询方式
    if (Object.keys(whereConditions).length > 0) {
      return await this.contentsRepository.count({ where: whereConditions });
    } else {
      return await this.contentsRepository.count(); // 不传where参数
    }
  }

  /**
   * 添加内容
   */
  async addContents(params: any): Promise<Contents> {
    const INSERT_SQL = `INSERT INTO contents (fileName, id, href, \`order\`, level, text, label, pid, navId) VALUES ('${params.fileName}', '${params.id}', '${params.href}', ${params.order}, ${params.level}, '${params.text}', '${params.label}', '${params.pid}', '${params.navId}')`;

    await this.contentsRepository.query(INSERT_SQL);

    // 返回创建的内容
    const result = await this.contentsRepository.findOne({
      where: {
        fileName: params.fileName,
        navId: params.navId,
      },
    });

    return result || ({} as Contents);
  }

  /**
   * 删除内容
   */
  async deleteContents(fileName: string): Promise<void> {
    const DELETE_SQL = `DELETE FROM contents WHERE fileName="${fileName}"`;
    await this.contentsRepository.query(DELETE_SQL);
  }
}
