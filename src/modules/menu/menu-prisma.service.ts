import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Menu } from '@prisma/client';

/**
 * 菜单服务 - Prisma版本
 * 使用Prisma ORM进行数据库操作
 */
@Injectable()
export class MenuPrismaService {
  private readonly logger = new Logger(MenuPrismaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建菜单
   */
  async create(menuData: Omit<Menu, 'id'>): Promise<Menu> {
    try {
      const menu = await this.prisma.menu.create({
        data: menuData,
      });
      this.logger.log(`创建菜单成功: ${menu.name}`);
      return menu;
    } catch (error) {
      this.logger.error(`创建菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 查找所有菜单
   */
  async findAll(): Promise<Menu[]> {
    try {
      return await this.prisma.menu.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      this.logger.error(`查询所有菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID查找菜单
   */
  async findOne(id: number): Promise<Menu> {
    try {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
      });

      if (!menu) {
        throw new NotFoundException(`菜单 ID ${id} 不存在`);
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
      return await this.prisma.menu.findMany({
        where: { pid: parentId },
        orderBy: { id: 'asc' },
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
      return await this.prisma.menu.findMany({
        where: { active: status },
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      this.logger.error(`根据状态查询菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 查找激活的菜单
   */
  async findActive(): Promise<Menu[]> {
    return this.findByStatus(1);
  }

  /**
   * 更新菜单
   */
  async update(
    id: number,
    updateData: Partial<Omit<Menu, 'id'>>,
  ): Promise<Menu> {
    try {
      const menu = await this.prisma.menu.update({
        where: { id },
        data: updateData,
      });
      this.logger.log(`更新菜单成功: ${menu.name}`);
      return menu;
    } catch (error) {
      this.logger.error(`更新菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除菜单
   */
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.menu.delete({
        where: { id },
      });
      this.logger.log(`删除菜单成功: ID ${id}`);
    } catch (error) {
      this.logger.error(`删除菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID删除菜单
   */
  async deleteById(id: number): Promise<void> {
    return this.remove(id);
  }

  /**
   * 根据ID查找菜单
   */
  async findById(id: number): Promise<Menu> {
    return this.findOne(id);
  }

  /**
   * 获取菜单总数
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.menu.count();
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
        this.prisma.menu.findMany({
          skip,
          take: limit,
          orderBy: { id: 'asc' },
        }),
        this.prisma.menu.count(),
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
   * 搜索菜单
   */
  async search(keyword: string): Promise<Menu[]> {
    try {
      return await this.prisma.menu.findMany({
        where: {
          OR: [
            { name: { contains: keyword } },
            { path: { contains: keyword } },
          ],
        },
        orderBy: { id: 'asc' },
      });
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
      await this.prisma.menu.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      this.logger.log(`批量删除菜单成功: ${ids.join(', ')}`);
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
