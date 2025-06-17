import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './crate-user.dto';
import * as md5 from 'md5';

/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实体
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
      this.logger.error(`Failed to find users: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve users');
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
          `Username ${createUserDto.username} already exists`,
        );
      }

      // 密码加密
      const user = this.userRepository.create({
        ...createUserDto,
        password: md5(createUserDto.password).toUpperCase(),
      });

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
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
        throw new NotFoundException(`User with username ${username} not found`);
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
      return await this.userRepository.update({ username }, updateData);
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return await this.userRepository.delete(id);
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实体
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }
}
