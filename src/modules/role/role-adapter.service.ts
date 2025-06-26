import { Injectable, Logger } from '@nestjs/common';
import { OrmFactoryService } from '../orm/orm-factory.service';
import { RoleService } from './role.service';
import { RolePrismaService } from './role-prisma.service';
import { Role } from './role.entity';
import { Role as PrismaRole } from '@prisma/client';

/**
 * 角色适配器服务
 * 根据ORM类型选择相应的服务实现
 */
@Injectable()
export class RoleAdapterService {
  private readonly logger = new Logger(RoleAdapterService.name);

  constructor(
    private ormFactory: OrmFactoryService,
    private roleService: RoleService,
    private rolePrismaService: RolePrismaService,
  ) {}

  /**
   * 创建角色
   */
  async create(roleData: any): Promise<Role | PrismaRole> {
    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData = {
        name: roleData.name,
        remark: roleData.remark || roleData.description || '',
      };
      return await this.rolePrismaService.create(prismaData);
    }
    return await this.roleService.create(roleData);
  }

  /**
   * 查找所有角色
   */
  async findAll(): Promise<(Role | PrismaRole)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.findAll();
    }
    return await this.roleService.findAll();
  }

  /**
   * 根据ID查找角色
   */
  async findOne(id: number): Promise<Role | PrismaRole> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.findOne(id);
    }
    return await this.roleService.findOne(id);
  }

  /**
   * 根据名称查找角色
   */
  // async findByName(name: string): Promise<Role | PrismaRole | null> {
  //   if (this.ormFactory.isPrisma()) {
  //     return await this.rolePrismaService.findByName(name);
  //   }
  //   return await this.roleService.findByName(name);
  // }

  /**
   * 更新角色
   */
  async update(id: number, updateData?: any): Promise<Role | PrismaRole> {
    // 如果没有传递 updateData，则使用 id 作为数据（兼容旧的调用方式）
    const data = updateData || id;
    const roleId = updateData ? id : data.id || data;

    if (this.ormFactory.isPrisma()) {
      // 转换数据类型以适配Prisma
      const prismaData: any = {};
      if (data.name !== undefined) prismaData.name = data.name;
      if (data.remark !== undefined) prismaData.remark = data.remark;
      if (data.description !== undefined) prismaData.remark = data.description;

      return await this.rolePrismaService.update(roleId, prismaData);
    }
    return await this.roleService.update(data);
  }

  /**
   * 删除角色
   */
  async remove(id: number): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.remove(id);
    }
    await this.roleService.remove(id);
  }

  /**
   * 获取角色总数
   */
  // async count(): Promise<number> {
  //   if (this.ormFactory.isPrisma()) {
  //     return await this.rolePrismaService.count();
  //   }
  //   return await this.roleService.count();
  // }

  /**
   * 分页查询角色
   */
  // async findWithPagination(
  //   page: number = 1,
  //   limit: number = 10,
  // ): Promise<{
  //   data: (Role | PrismaRole)[];
  //   total: number;
  //   page: number;
  //   limit: number;
  //   totalPages: number;
  // }> {
  //   if (this.ormFactory.isPrisma()) {
  //     return await this.rolePrismaService.findWithPagination(page, limit);
  //   }
  //   return await this.roleService.findWithPagination(page, limit);
  // }

  /**
   * 搜索角色
   */
  // async search(keyword: string): Promise<(Role | PrismaRole)[]> {
  //   if (this.ormFactory.isPrisma()) {
  //     return await this.rolePrismaService.search(keyword);
  //   }
  //   return await this.roleService.search(keyword);
  // }

  /**
   * 批量删除角色
   */
  // async removeMany(ids: number[]): Promise<void> {
  //   if (this.ormFactory.isPrisma()) {
  //     return await this.rolePrismaService.removeMany(ids);
  //   }
  //   await this.roleService.removeMany(ids);
  // }

  /**
   * 检查角色名称是否存在
   */
  // async existsByName(name: string, excludeId?: number): Promise<boolean> {
  //   if (this.ormFactory.isPrisma()) {
  //     return await this.rolePrismaService.existsByName(name, excludeId);
  //   }
  //   return await this.roleService.existsByName(name, excludeId);
  // }

  // 以下方法用于兼容现有的控制器接口

  /**
   * 删除角色菜单关联
   */
  async removeRoleMenu(roleId: number): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.removeRoleMenu(roleId);
    }
    return await this.roleService.removeRoleMenu(roleId);
  }

  /**
   * 删除角色权限关联
   */
  async removeRoleAuth(data: any): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.removeRoleAuth(data);
    }
    return await this.roleService.removeRoleAuth(data);
  }

  /**
   * 删除权限
   */
  async removeAuth(id: number): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.removeAuth(id);
    }
    return await this.roleService.removeAuth(id);
  }

  /**
   * 获取权限列表
   */
  async getAuthList(query: any): Promise<any[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.getAuthList(query);
    }
    return await this.roleService.getAuthList(query);
  }

  /**
   * 创建权限
   */
  async createAuth(authData: any): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.createAuth(authData);
    }
    return await this.roleService.createAuth(authData);
  }

  /**
   * 更新权限
   */
  async updateAuth(authData: any): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.updateAuth(authData);
    }
    return await this.roleService.updateAuth(authData);
  }

  /**
   * 创建角色菜单关联
   */
  async createRoleMenu(data: any): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.createRoleMenu(data);
    }
    return await this.roleService.createRoleMenu(data);
  }

  /**
   * 获取角色菜单
   */
  async getRoleMenu(roleId: number): Promise<any[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.getRoleMenu(roleId);
    }
    return await this.roleService.getRoleMenu(roleId);
  }

  /**
   * 创建角色权限关联
   */
  async createRoleAuth(data: any): Promise<any> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.createRoleAuth(data);
    }
    return await this.roleService.createRoleAuth(data);
  }

  /**
   * 获取角色权限
   */
  async getRoleAuth(roleId: number): Promise<any[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.getRoleAuth(roleId);
    }
    return await this.roleService.getRoleAuth(roleId);
  }

  /**
   * 根据角色名称获取角色权限
   */
  async getRoleAuthByRoleName(roleName: string): Promise<any[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.rolePrismaService.getRoleAuthByRoleName(roleName);
    }
    return await this.roleService.getRoleAuthByRoleName(roleName);
  }

  /**
   * 获取当前使用的ORM信息
   */
  getOrmInfo() {
    return this.ormFactory.getOrmInfo();
  }
}
