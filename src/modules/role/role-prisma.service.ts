import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * 角色服务 - Prisma版本
 * 使用Prisma ORM进行数据库操作
 */
@Injectable()
export class RolePrismaService {
  private readonly logger = new Logger(RolePrismaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建角色
   */
  async create(roleData: Omit<Role, 'id'>): Promise<Role> {
    try {
      const role = await this.prisma.role.create({
        data: roleData,
      });
      this.logger.log(`创建角色成功: ${role.name}`);
      return role;
    } catch (error) {
      this.logger.error(`创建角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 查找所有角色
   */
  async findAll(): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      this.logger.error(`查询所有角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID查找角色
   */
  async findOne(id: number): Promise<Role> {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException(`角色 ID ${id} 不存在`);
      }

      return role;
    } catch (error) {
      this.logger.error(`查询角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据名称查找角色
   */
  async findByName(name: string): Promise<Role | null> {
    try {
      return await this.prisma.role.findUnique({
        where: { name },
      });
    } catch (error) {
      this.logger.error(`根据名称查询角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新角色
   */
  async update(
    id: number,
    updateData: Partial<Omit<Role, 'id'>>,
  ): Promise<Role> {
    try {
      const role = await this.prisma.role.update({
        where: { id },
        data: updateData,
      });
      this.logger.log(`更新角色成功: ${role.name}`);
      return role;
    } catch (error) {
      this.logger.error(`更新角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除角色
   */
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.role.delete({
        where: { id },
      });
      this.logger.log(`删除角色成功: ID ${id}`);
    } catch (error) {
      this.logger.error(`删除角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取角色总数
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.role.count();
    } catch (error) {
      this.logger.error(`获取角色总数失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分页查询角色
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Role[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.prisma.role.findMany({
          skip,
          take: limit,
          orderBy: { id: 'asc' },
        }),
        this.prisma.role.count(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`分页查询角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 搜索角色
   */
  async search(keyword: string): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany({
        where: {
          OR: [
            { name: { contains: keyword } },
            { remark: { contains: keyword } },
          ],
        },
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      this.logger.error(`搜索角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量删除角色
   */
  async removeMany(ids: number[]): Promise<void> {
    try {
      await this.prisma.role.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      this.logger.log(`批量删除角色成功: ${ids.join(', ')}`);
    } catch (error) {
      this.logger.error(`批量删除角色失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查角色名称是否存在
   */
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    try {
      const where: any = { name };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await this.prisma.role.count({ where });
      return count > 0;
    } catch (error) {
      this.logger.error(`检查角色名称是否存在失败: ${error.message}`);
      throw error;
    }
  }

  // 以下方法用于兼容现有的 RoleService 接口

  /**
   * 删除角色菜单关联
   */
  async removeRoleMenu(roleId: number): Promise<any> {
    try {
      return await this.prisma.role_menu.deleteMany({
        where: { roleId },
      });
    } catch (error) {
      this.logger.error(`删除角色菜单关联失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除角色权限关联
   */
  async removeRoleAuth(data: { roleId: number; authId: number }): Promise<any> {
    try {
      return await this.prisma.role_auth.deleteMany({
        where: {
          roleId: data.roleId,
          authId: data.authId,
        },
      });
    } catch (error) {
      this.logger.error(`删除角色权限关联失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除权限
   */
  async removeAuth(id: number): Promise<any> {
    try {
      return await this.prisma.auth.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`删除权限失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取权限列表
   */
  async getAuthList(query: any): Promise<any[]> {
    try {
      const { key } = query;
      const where: any = {};

      if (key) {
        where.key = {
          contains: key,
        };
      }

      return await this.prisma.auth.findMany({
        where,
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      this.logger.error(`获取权限列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建权限
   */
  async createAuth(authData: any): Promise<any> {
    try {
      const { key = '', name = '', remark = '' } = authData;
      return await this.prisma.auth.create({
        data: {
          key,
          name,
          remark,
        },
      });
    } catch (error) {
      this.logger.error(`创建权限失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新权限
   */
  async updateAuth(authData: any): Promise<any> {
    try {
      const { id, key, name, remark } = authData;
      const updateData: any = {};

      if (key !== undefined) updateData.key = key;
      if (name !== undefined) updateData.name = name;
      if (remark !== undefined) updateData.remark = remark;

      if (Object.keys(updateData).length === 0) {
        return {};
      }

      return await this.prisma.auth.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`更新权限失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建角色菜单关联
   */
  async createRoleMenu(data: { roleId: number; menuId: number }): Promise<any> {
    try {
      return await this.prisma.role_menu.create({
        data,
      });
    } catch (error) {
      this.logger.error(`创建角色菜单关联失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取角色菜单
   */
  async getRoleMenu(roleId: number): Promise<any[]> {
    try {
      return await this.prisma.role_menu.findMany({
        where: { roleId },
      });
    } catch (error) {
      this.logger.error(`获取角色菜单失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建角色权限关联
   */
  async createRoleAuth(data: { roleId: number; authId: number }): Promise<any> {
    try {
      return await this.prisma.role_auth.create({
        data,
      });
    } catch (error) {
      this.logger.error(`创建角色权限关联失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取角色权限
   */
  async getRoleAuth(roleId: number): Promise<any[]> {
    try {
      return await this.prisma.role_auth.findMany({
        where: { roleId },
      });
    } catch (error) {
      this.logger.error(`获取角色权限失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据角色名称获取角色权限
   */
  async getRoleAuthByRoleName(roleName: string): Promise<any[]> {
    try {
      // 解析JSON数组格式的角色名，与TypeORM版本保持一致
      const roleNames = JSON.parse(roleName);

      // 查找所有匹配的角色
      const roles = await this.prisma.role.findMany({
        where: {
          name: { in: roleNames },
        },
      });

      if (roles.length === 0) {
        return [];
      }

      const roleIds = roles.map((role) => role.id);

      // 查找角色权限关联
      const roleAuths = await this.prisma.role_auth.findMany({
        where: { roleId: { in: roleIds } },
      });

      // 去重authId
      const authIds = [...new Set(roleAuths.map((ra) => ra.authId))];

      if (authIds.length === 0) {
        return [];
      }

      // 查找权限信息
      return await this.prisma.auth.findMany({
        where: {
          id: { in: authIds },
        },
      });
    } catch (error) {
      this.logger.error(`根据角色名称获取角色权限失败: ${error.message}`);
      throw error;
    }
  }
}
