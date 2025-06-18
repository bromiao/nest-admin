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
  @Cacheable('menu:findAll', 60 * 60 * 1000) // 缓存1小时
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
        this.CACHE_TTL
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
