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
import { Cacheable } from '../cache/cache.decorator';

/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
@Injectable()
export class UserService {
  // 缓存键前缀
  private readonly CACHE_PREFIX = 'user';
  // 缓存过期时间（毫秒）
  private readonly CACHE_TTL = 60 * 1000;

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
  @Cacheable('user:findOne', 60 * 1000) // 缓存30分钟
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
  async findAll(query: any): Promise<User[]> {
    try {
      // 生成缓存键
      const cacheKey = `${this.CACHE_PREFIX}:findAll:${JSON.stringify(query)}`;

      // 尝试从缓存获取
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          this.logger.debug(`从数据库查询用户列表`);

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
        },
        this.CACHE_TTL,
      );
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

      // 清除相关缓存
      await this.clearUserCache();

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

      // 清除相关缓存
      await this.clearUserCache(username);

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
  async remove(id: number): Promise<DeleteResult> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    const result = await this.userRepository.delete(id);

    // 清除相关缓存
    await this.clearUserCache(user.username);
    await this.cacheService.delete(`${this.CACHE_PREFIX}:findOne:${id}`);

    return result;
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实体
   */
  async findByUsername(username: string): Promise<User> {
    try {
      // 生成缓存键
      const cacheKey = `${this.CACHE_PREFIX}:findByUsername:${username}`;

      // 尝试从缓存获取
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          this.logger.debug(`从数据库查询用户，用户名: ${username}`);
          const user = await this.userRepository.findOneBy({ username });
          if (!user) {
            throw new NotFoundException(`用户名 ${username} 不存在`);
          }
          return user;
        },
        this.CACHE_TTL,
      );
    } catch (error) {
      this.logger.error(`查询用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清除用户相关的缓存
   * @param username 用户名（可选）
   */
  private async clearUserCache(username?: string): Promise<void> {
    try {
      // 如果提供了用户名，则清除该用户的缓存
      if (username) {
        await this.cacheService.delete(
          `${this.CACHE_PREFIX}:findByUsername:${username}`,
        );
        this.logger.debug(`已清除用户缓存: ${username}`);
      }

      // 清除用户列表缓存
      // 由于缓存键包含查询参数，无法精确清除，所以这里使用重置所有缓存
      // 在实际应用中，可以使用更精细的缓存管理策略
      await this.cacheService.reset();
      this.logger.debug('已重置所有缓存');
    } catch (error) {
      this.logger.error(`清除缓存失败: ${error.message}`, error.stack);
    }
  }
}
