import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './crate-user.dto';
import { AdminUser } from '@prisma/client';
import * as md5 from 'md5';

/**
 * 用户服务 - Prisma版本
 * 使用Prisma ORM进行数据库操作
 */
@Injectable()
export class UserPrismaService {
  private readonly logger = new Logger(UserPrismaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<AdminUser> {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.prisma.adminUser.findUnique({
        where: { username: createUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }

      // 创建用户
      const user = await this.prisma.adminUser.create({
        data: {
          username: createUserDto.username,
          password: md5(createUserDto.password),
          avatar: createUserDto.avatar || '',
          role: createUserDto.role || 'user',
          nickname: createUserDto.nickname || '',
          active: 1,
        },
      });

      this.logger.log(`User created with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw error;
    }
  }

  /**
   * 查找所有用户
   */
  async findAll(): Promise<AdminUser[]> {
    try {
      return await this.prisma.adminUser.findMany({
        orderBy: { id: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error finding all users', error);
      throw error;
    }
  }

  /**
   * 根据ID查找用户
   */
  async findOne(id: number): Promise<AdminUser> {
    try {
      const user = await this.prisma.adminUser.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`用户ID ${id} 不存在`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<AdminUser | null> {
    try {
      return await this.prisma.adminUser.findUnique({
        where: { username },
      });
    } catch (error) {
      this.logger.error(`Error finding user with username ${username}`, error);
      throw error;
    }
  }

  /**
   * 更新用户
   */
  async update(
    id: number,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<AdminUser> {
    try {
      // 检查用户是否存在
      await this.findOne(id);

      // 如果更新密码，需要加密
      const updateData = { ...updateUserDto };
      if (updateData.password) {
        updateData.password = md5(updateData.password);
      }

      const user = await this.prisma.adminUser.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`User updated with ID: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error updating user with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<void> {
    try {
      // 检查用户是否存在
      await this.findOne(id);

      await this.prisma.adminUser.delete({
        where: { id },
      });

      this.logger.log(`User deleted with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting user with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * 获取用户总数
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.adminUser.count();
    } catch (error) {
      this.logger.error('Error counting users', error);
      throw error;
    }
  }

  /**
   * 分页查询用户
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.adminUser.findMany({
          skip,
          take: limit,
          orderBy: { id: 'desc' },
        }),
        this.prisma.adminUser.count(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error finding users with pagination', error);
      throw error;
    }
  }

  /**
   * 激活/停用用户
   */
  async toggleActive(id: number): Promise<AdminUser> {
    try {
      const user = await this.findOne(id);

      const updatedUser = await this.prisma.adminUser.update({
        where: { id },
        data: { active: user.active === 1 ? 0 : 1 },
      });

      this.logger.log(
        `User ${id} active status toggled to ${updatedUser.active}`,
      );
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error toggling active status for user ${id}`, error);
      throw error;
    }
  }
}
