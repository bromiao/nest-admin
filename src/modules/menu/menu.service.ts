import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { Cacheable } from '../cache/cache.decorator';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);
  // 缓存键前缀
  private readonly CACHE_PREFIX = 'menu';
  // 缓存过期时间（毫秒）
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1小时

  constructor(
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 获取所有菜单
   */
  @Cacheable({ key: 'menu:findAll', ttl: 3600 })
  async findAll(): Promise<Menu[]> {
    this.logger.debug('从数据库查询所有菜单');
    const QUERY_ALL_SQL = 'SELECT * FROM menu ORDER BY id DESC';
    return this.menuRepository.query(QUERY_ALL_SQL);
  }

  /**
   * 获取激活的菜单
   */
  async findActive(): Promise<Menu[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:findActive`;
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
   */
  async create(menuData: any): Promise<Menu> {
    try {
      const menu = this.menuRepository.create(menuData);
      const savedMenu = await this.menuRepository.save(menu);
      // 确保 savedMenu 是单个对象而不是数组
      const result = Array.isArray(savedMenu) ? savedMenu[0] : savedMenu;
      this.logger.log(`创建菜单成功: ${result.name}`);
      await this.clearMenuCache();
      return result;
    } catch (error) {
      this.logger.error(`创建菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新菜单
   */
  async update(menuData: any): Promise<Menu> {
    try {
      const { id, ...updateData } = menuData;
      await this.menuRepository.update(id, updateData);
      const updatedMenu = await this.findOne(id);
      this.logger.log(`更新菜单成功: ${updatedMenu.name}`);
      await this.clearMenuCache();
      return updatedMenu;
    } catch (error) {
      this.logger.error(`更新菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID查找菜单
   */
  async findById(id: number): Promise<Menu> {
    return this.findOne(id);
  }

  /**
   * 根据ID删除菜单
   */
  async deleteById(id: number): Promise<void> {
    return this.remove(id);
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

  /**
   * 根据ID查找菜单
   */
  async findOne(id: number): Promise<Menu> {
    try {
      const menu = await this.menuRepository.findOne({ where: { id } });
      if (!menu) {
        throw new Error(`菜单 ID ${id} 不存在`);
      }
      return menu;
    } catch (error) {
      this.logger.error(`查询菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据父级ID查找子菜单
   */
  async findByParentId(parentId: number): Promise<Menu[]> {
    try {
      return await this.menuRepository.find({
        where: { pid: parentId },
        order: { id: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`查询子菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据状态查找菜单
   */
  async findByStatus(status: number): Promise<Menu[]> {
    try {
      return await this.menuRepository.find({
        where: { active: status },
        order: { id: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`根据状态查询菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除菜单
   */
  async remove(id: number): Promise<void> {
    try {
      await this.menuRepository.delete(id);
      this.logger.log(`删除菜单成功: ID ${id}`);
      await this.clearMenuCache();
    } catch (error) {
      this.logger.error(`删除菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取菜单总数
   */
  async count(): Promise<number> {
    try {
      return await this.menuRepository.count();
    } catch (error) {
      this.logger.error(`获取菜单总数失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分页查询菜单
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Menu[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.menuRepository.find({
          skip,
          take: limit,
          order: { id: 'ASC' },
        }),
        this.menuRepository.count(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`分页查询菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据权限查找菜单
   */
  async findByPermission(permission: string): Promise<Menu[]> {
    try {
      return await this.menuRepository.find({
        order: { id: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`根据权限查询菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 搜索菜单
   */
  async search(keyword: string): Promise<Menu[]> {
    try {
      return await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.name LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('menu.path LIKE :keyword', { keyword: `%${keyword}%` })
        .orderBy('menu.id', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`搜索菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量删除菜单
   */
  async removeMany(ids: number[]): Promise<void> {
    try {
      await this.menuRepository.delete(ids);
      this.logger.log(`批量删除菜单成功: ${ids.join(', ')}`);
      await this.clearMenuCache();
    } catch (error) {
      this.logger.error(`批量删除菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 构建菜单树
   */
  async buildMenuTree(): Promise<Menu[]> {
    try {
      const allMenus = await this.findAll();
      return this.buildTree(allMenus, 0);
    } catch (error) {
      this.logger.error(`构建菜单树失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 递归构建树结构
   */
  private buildTree(menus: Menu[], parentId: number): Menu[] {
    return menus
      .filter((menu) => menu.pid === parentId)
      .map((menu) => ({
        ...menu,
        children: this.buildTree(menus, menu.id),
      }));
  }
}
