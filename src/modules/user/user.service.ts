import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './crate-user.dto';
import * as md5 from 'md5';
import { CacheService } from '../cache/cache.service';
import { LoggerService } from '../logger/logger.service';
import { Cacheable, CacheEvict, CachePut } from '../cache/cache.decorator';

/**
 * 用户服务
 * 处理用户相关的业务逻辑，集成Redis缓存
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('UserService');
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实体
   */
  @Cacheable({ key: 'user:${0}', ttl: 300 }) // 缓存5分钟
  async findOne(id: number): Promise<User> {
    this.logger.debug(`查找用户，ID: ${id}`);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  /**
   * 根据查询条件查找用户列表
   * @param query 查询参数
   * @returns 用户列表
   */
  @Cacheable({
    key: 'users:list:${0}',
    ttl: 180,
    condition: (query) => !query.realtime, // 只有非实时查询才缓存
  })
  async findAll(query: any): Promise<User[]> {
    try {
      this.logger.debug(`从数据库查询用户列表`, undefined, { query });

      // 构建查询条件
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      // 添加过滤条件
      if (query.id) {
        queryBuilder.andWhere('user.id = :id', { id: query.id });
      }
      if (query.username) {
        queryBuilder.andWhere('user.username = :username', {
          username: query.username,
        });
      }
      if (query.active !== undefined) {
        queryBuilder.andWhere('user.active = :active', {
          active: query.active,
        });
      }

      // 分页处理
      const page = Math.max(1, +query.page || 1);
      const pageSize = Math.max(1, +query.pageSize || 20);
      const skip = (page - 1) * pageSize;

      // 选择需要的字段并执行查询
      return await queryBuilder
        .select([
          'user.id',
          'user.username',
          'user.avatar',
          'user.role',
          'user.nickname',
          'user.active',
        ])
        .skip(skip)
        .take(pageSize)
        .getMany();
    } catch (error) {
      this.logger.error(`查询用户列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取用户列表失败');
    }
  }

  /**
   * 创建新用户
   * @param createUserDto 用户创建DTO
   * @returns 创建的用户实体
   */
  @CacheEvict(['users:list:*', 'users:count']) // 清除用户列表和统计缓存
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.userRepository.findOneBy({
        username: createUserDto.username,
      });

      if (existingUser) {
        throw new BadRequestException(
          `用户名 ${createUserDto.username} 已存在`,
        );
      }

      // 密码加密
      const user = this.userRepository.create({
        ...createUserDto,
        password: md5(createUserDto.password).toUpperCase(),
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`用户创建成功: ${savedUser.username}`);

      return savedUser;
    } catch (error) {
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param params 更新参数
   * @returns 更新结果
   */
  @CacheEvict([
    'user:${username}',
    'users:list:*',
    'users:username:${username}',
  ])
  @CachePut({ key: 'user:updated:${username}', ttl: 300 })
  async update(params: any): Promise<any> {
    try {
      const { username, nickname, active, role } = params;

      // 检查用户是否存在
      const user = await this.userRepository.findOneBy({ username });
      if (!user) {
        throw new NotFoundException(`用户名 ${username} 不存在`);
      }

      // 构建更新对象
      const updateData: Partial<User> = {};

      if (nickname !== undefined) {
        updateData.nickname = nickname;
      }
      if (active !== undefined) {
        updateData.active = active;
      }
      if (role !== undefined) {
        updateData.role = role;
      }

      // 执行更新
      const result = await this.userRepository.update({ username }, updateData);
      this.logger.log(`用户更新成功: ${username}`, undefined, { updateData });

      return result;
    } catch (error) {
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  @CacheEvict(['user:${0}', 'users:list:*', 'users:username:*'])
  async remove(id: number): Promise<DeleteResult> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    const result = await this.userRepository.delete(id);
    this.logger.log(`用户删除成功: ${user.username} (ID: ${id})`);

    return result;
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实体
   */
  @Cacheable({ key: 'users:username:${0}', ttl: 600 }) // 缓存10分钟
  async findByUsername(username: string): Promise<User> {
    try {
      this.logger.debug(`从数据库查询用户，用户名: ${username}`);
      const user = await this.userRepository.findOneBy({ username });
      if (!user) {
        throw new NotFoundException(`用户名 ${username} 不存在`);
      }
      return user;
    } catch (error) {
      this.logger.error(`查询用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取用户统计信息
   * @returns 用户统计
   */
  @Cacheable({ key: 'users:stats', ttl: 1800 }) // 缓存30分钟
  async getUserStats(): Promise<any> {
    try {
      const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { active: 1 } }),
        this.userRepository.count({ where: { active: 0 } }),
      ]);

      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        timestamp: new Date().toISOString(),
      };

      this.logger.debug('获取用户统计信息', undefined, stats);
      return stats;
    } catch (error) {
      this.logger.error(`获取用户统计失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取用户统计失败');
    }
  }

  /**
   * 批量获取用户信息
   * @param ids 用户ID数组
   * @returns 用户列表
   */
  async findByIds(ids: number[]): Promise<User[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    try {
      // 尝试从缓存中获取用户信息
      const users: User[] = [];
      const missingIds: number[] = [];

      for (const id of ids) {
        const cachedUser = await this.cacheService.get<User>(`user:${id}`);
        if (cachedUser) {
          users.push(cachedUser);
        } else {
          missingIds.push(id);
        }
      }

      // 如果有未缓存的用户，从数据库查询
      if (missingIds.length > 0) {
        const dbUsers = await this.userRepository.findByIds(missingIds);

        // 将查询到的用户添加到结果中并缓存
        for (const user of dbUsers) {
          users.push(user);
          await this.cacheService.set(`user:${user.id}`, user, 300);
        }
      }

      return users;
    } catch (error) {
      this.logger.error(`批量查询用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('批量查询用户失败');
    }
  }

  /**
   * 清除指定用户的所有相关缓存
   * @param userId 用户ID
   * @param username 用户名
   */
  async clearUserCache(userId?: number, username?: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      if (userId) {
        keysToDelete.push(`user:${userId}`);
      }

      if (username) {
        keysToDelete.push(`users:username:${username}`);
      }

      // 清除用户列表缓存
      await this.cacheService.deleteByPattern('users:list:*');

      // 清除统计缓存
      keysToDelete.push('users:stats');

      // 批量删除缓存
      await Promise.all(
        keysToDelete.map((key) => this.cacheService.delete(key)),
      );

      this.logger.debug(`已清除用户缓存`, undefined, {
        userId,
        username,
        keysCount: keysToDelete.length,
      });
    } catch (error) {
      this.logger.error(`清除用户缓存失败: ${error.message}`, error.stack);
    }
  }
}
