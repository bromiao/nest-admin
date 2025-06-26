import { Injectable, Logger } from '@nestjs/common';
import { OrmFactoryService } from '../orm/orm-factory.service';
import { MenuService } from './menu.service';
import { MenuPrismaService } from './menu-prisma.service';
import { Menu } from './menu.entity';
import { Menu as PrismaMenu } from '@prisma/client';

/**
 * 菜单适配器服务
 * 根据ORM类型选择相应的服务实现
 */
@Injectable()
export class MenuAdapterService {
  private readonly logger = new Logger(MenuAdapterService.name);

  constructor(
    private ormFactory: OrmFactoryService,
    private menuService: MenuService,
    private menuPrismaService: MenuPrismaService,
  ) {}

  /**
   * 创建菜单
   */
  async create(menuData: any): Promise<Menu | PrismaMenu> {
    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData = {
        path: menuData.path || '',
        name: menuData.name || '',
        redirect: menuData.redirect || '',
        meta: menuData.meta || '',
        pid: menuData.pid || menuData.parentId || 0,
        active: menuData.active || menuData.status || 1,
      };
      return await this.menuPrismaService.create(prismaData);
    }
    return await this.menuService.create(menuData);
  }

  /**
   * 查找所有菜单
   */
  async findAll(): Promise<(Menu | PrismaMenu)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.findAll();
    }
    return await this.menuService.findAll();
  }

  /**
   * 根据ID查找菜单
   */
  async findOne(id: number): Promise<Menu | PrismaMenu> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.findOne(id);
    }
    return await this.menuService.findOne(id);
  }

  /**
   * 根据ID查找菜单
   */
  async findById(id: number): Promise<Menu | PrismaMenu> {
    return this.findOne(id);
  }

  /**
   * 根据父级ID查找子菜单
   */
  async findByParentId(parentId: number): Promise<(Menu | PrismaMenu)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.findByParentId(parentId);
    }
    return await this.menuService.findByParentId(parentId);
  }

  /**
   * 根据状态查找菜单
   */
  async findByStatus(status: number): Promise<(Menu | PrismaMenu)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.findByStatus(status);
    }
    return await this.menuService.findByStatus(status);
  }

  /**
   * 查找激活的菜单
   */
  async findActive(): Promise<(Menu | PrismaMenu)[]> {
    return this.findByStatus(1);
  }

  /**
   * 更新菜单
   */
  async update(id: number, updateData?: any): Promise<Menu | PrismaMenu> {
    // 如果没有传递 updateData，则使用 id 作为数据（兼容旧的调用方式）
    const data = updateData || id;
    const menuId = updateData ? id : data.id || data;

    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData: any = {};
      if (data.path !== undefined) prismaData.path = data.path;
      if (data.name !== undefined) prismaData.name = data.name;
      if (data.redirect !== undefined) prismaData.redirect = data.redirect;
      if (data.meta !== undefined) prismaData.meta = data.meta;
      if (data.pid !== undefined) prismaData.pid = data.pid;
      if (data.parentId !== undefined) prismaData.pid = data.parentId;
      if (data.active !== undefined) prismaData.active = data.active;
      if (data.status !== undefined) prismaData.active = data.status;

      return await this.menuPrismaService.update(menuId, prismaData);
    }
    return await this.menuService.update(data);
  }

  /**
   * 删除菜单
   */
  async remove(id: number): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.remove(id);
    }
    await this.menuService.remove(id);
  }

  /**
   * 根据ID删除菜单
   */
  async deleteById(id: number): Promise<void> {
    return this.remove(id);
  }

  /**
   * 获取菜单总数
   */
  async count(): Promise<number> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.count();
    }
    return await this.menuService.count();
  }

  /**
   * 分页查询菜单
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: (Menu | PrismaMenu)[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.findWithPagination(page, limit);
    }
    return await this.menuService.findWithPagination(page, limit);
  }

  /**
   * 搜索菜单
   */
  async search(keyword: string): Promise<(Menu | PrismaMenu)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.search(keyword);
    }
    return await this.menuService.search(keyword);
  }

  /**
   * 批量删除菜单
   */
  async removeMany(ids: number[]): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.removeMany(ids);
    }
    await this.menuService.removeMany(ids);
  }

  /**
   * 构建菜单树
   */
  async buildMenuTree(): Promise<(Menu | PrismaMenu)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.menuPrismaService.buildMenuTree();
    }
    return await this.menuService.buildMenuTree();
  }

  /**
   * 获取当前使用的ORM信息
   */
  getOrmInfo() {
    return this.ormFactory.getOrmInfo();
  }
}
