import { Injectable, Logger } from '@nestjs/common';
import { OrmFactoryService } from '../orm/orm-factory.service';
import { UserService } from './user.service';
import { UserPrismaService } from './user-prisma.service';
import { CreateUserDto } from './crate-user.dto';
import { User } from './user.entity';
import { AdminUser } from '@prisma/client';

/**
 * 用户适配器服务
 * 根据ORM类型选择相应的服务实现
 */
@Injectable()
export class UserAdapterService {
  private readonly logger = new Logger(UserAdapterService.name);

  constructor(
    private ormFactory: OrmFactoryService,
    private userService: UserService,
    private userPrismaService: UserPrismaService,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User | AdminUser> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.create(createUserDto);
    }
    return await this.userService.create(createUserDto);
  }

  /**
   * 查找所有用户
   */
  async findAll(): Promise<(User | AdminUser)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.findAll();
    }
    return await this.userService.findAll({});
  }

  /**
   * 根据ID查找用户
   */
  async findOne(id: number): Promise<User | AdminUser> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.findOne(id);
    }
    return await this.userService.findOne(id);
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | AdminUser | null> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.findByUsername(username);
    }
    return await this.userService.findByUsername(username);
  }

  /**
   * 更新用户
   */
  async update(
    id: number,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User | AdminUser> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.update(id, updateUserDto);
    }
    // TypeORM版本的update方法需要不同的参数格式
    const user = await this.userService.findOne(id);
    await this.userService.update({
      ...updateUserDto,
      username: user.username,
    });
    return await this.userService.findOne(id);
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<void> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.remove(id);
    }
    await this.userService.remove(id);
  }

  /**
   * 获取用户总数
   */
  async count(): Promise<number> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.count();
    }
    return await this.userService.count();
  }

  /**
   * 分页查询用户
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: (User | AdminUser)[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.findWithPagination(page, limit);
    }
    return await this.userService.findWithPagination(page, limit);
  }

  /**
   * 激活/停用用户
   */
  async toggleActive(id: number): Promise<User | AdminUser> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.toggleActive(id);
    }
    return await this.userService.toggleActive(id);
  }

  /**
   * 获取当前使用的ORM信息
   */
  getOrmInfo() {
    return this.ormFactory.getOrmInfo();
  }
}
