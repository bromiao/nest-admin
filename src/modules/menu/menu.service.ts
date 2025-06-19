import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { LoggerService } from '../logger/logger.service';
import { Cacheable } from '../cache/cache.decorator';

@Injectable()
export class MenuService {
  // 缓存键前缀
  private readonly CACHE_PREFIX = 'menu';
  // 缓存过期时间（毫秒）
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1小时

  constructor(
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('MenuService');
  }

  /**
   * 获取所有菜单
   * @returns 菜单列表
   */
  @Cacheable({ key: 'menu:findAll', ttl: 3600 }) // 缓存1小时
  async findAll() {
    this.logger.debug('从数据库查询所有菜单');
    const QUERY_ALL_SQL = 'SELECT * FROM menu ORDER BY id DESC';
    return this.menuRepository.query(QUERY_ALL_SQL);
  }

  /**
   * 获取激活的菜单
   * @returns 激活的菜单列表
   */
  async findActive() {
    try {
      // 生成缓存键
      const cacheKey = `${this.CACHE_PREFIX}:findActive`;

      // 尝试从缓存获取
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          this.logger.debug('从数据库查询激活的菜单');
          const QUERY_ALL_SQL =
            'SELECT * FROM menu WHERE active = 1 ORDER BY id DESC';
          return this.menuRepository.query(QUERY_ALL_SQL);
        },
        this.CACHE_TTL,
      );
    } catch (error) {
      this.logger.error(`查询激活菜单失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 创建菜单
   * @param body 菜单数据
   * @returns 创建结果
   */
  async create(body) {
    try {
      const result = await this.menuRepository.save(body);

      // 清除菜单缓存
      await this.clearMenuCache();

      return result;
    } catch (error) {
      this.logger.error(`创建菜单失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新菜单
   * @param body 菜单数据
   * @returns 更新结果
   */
  async update(body) {
    try {
      const id = body.data?.id || body.id;
      const data = body.data || body;

      const result = await this.menuRepository.update(id, data);

      // 清除菜单缓存
      await this.clearMenuCache();

      return result;
    } catch (error) {
      this.logger.error(`更新菜单失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据ID查找菜单
   * @param id 菜单ID
   * @returns 菜单信息
   */
  async findById(id: number) {
    try {
      const QUERY_BY_ID_SQL = 'SELECT * FROM menu WHERE id = ?';
      const result = await this.menuRepository.query(QUERY_BY_ID_SQL, [id]);
      this.logger.debug(`根据ID查询菜单: ${id}`, undefined, { result });
      return result[0] || null;
    } catch (error) {
      this.logger.error(
        `根据ID查询菜单失败 [${id}]: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 根据ID删除菜单
   * @param id 菜单ID
   * @returns 删除结果
   */
  async deleteById(id: number) {
    try {
      const DELETE_SQL = 'DELETE FROM menu WHERE id = ?';
      const result = await this.menuRepository.query(DELETE_SQL, [id]);
      this.logger.debug(`删除菜单: ${id}`, undefined, { result });

      // 清除缓存
      await this.clearMenuCache();

      return result;
    } catch (error) {
      this.logger.error(`删除菜单失败 [${id}]: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清除菜单相关的缓存
   */
  private async clearMenuCache(): Promise<void> {
    try {
      await this.cacheService.delete(`${this.CACHE_PREFIX}:findAll`);
      await this.cacheService.delete(`${this.CACHE_PREFIX}:findActive`);
      this.logger.debug('已清除菜单缓存');
    } catch (error) {
      this.logger.error(`清除菜单缓存失败: ${error.message}`, error.stack);
    }
  }
}
