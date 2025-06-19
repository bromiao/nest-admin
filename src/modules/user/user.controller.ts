import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './crate-user.dto';
import { wrapperResponse } from 'src/utils';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { CacheService } from '../cache/cache.service';

@ApiTags('user')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('info')
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '根据JWT令牌获取当前登录用户信息',
  })
  @ApiResponse({ status: 200, description: '获取用户信息成功', type: User })
  @ApiResponse({ status: 401, description: '未授权' })
  async getUserByToken(@Req() request) {
    const username = request.user.username;
    const cacheKey = `user:current:${username}`;

    try {
      // 尝试从缓存获取
      const cachedUser = await this.cacheService.get(cacheKey);
      if (cachedUser) {
        return {
          code: 0,
          data: cachedUser,
          message: '获取用户信息成功（缓存）',
        };
      }

      // 从数据库获取并缓存
      const user = await this.userService.findByUsername(username);
      await this.cacheService.set(cacheKey, user, 300); // 缓存5分钟

      return {
        code: 0,
        data: user,
        message: '获取用户信息成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '获取用户信息失败',
      };
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: '获取用户统计信息',
    description: '获取用户总数、活跃用户数等统计信息',
  })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  getUserStats() {
    return wrapperResponse(
      this.userService.getUserStats(),
      '获取用户统计信息成功',
    );
  }

  @Get('cache/clear/:id')
  @ApiOperation({
    summary: '清除用户缓存',
    description: '清除指定用户的所有相关缓存',
  })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  @ApiResponse({ status: 200, description: '清除缓存成功' })
  async clearUserCache(@Param('id', ParseIntPipe) id: number) {
    // 先获取用户信息以获得用户名
    const user = await this.userService.findOne(id);
    await this.userService.clearUserCache(id, user.username);
    return {
      code: 200,
      data: null,
      message: `用户 ${user.username} 的缓存已清除`,
    };
  }

  @Post('cache/warm-up')
  @ApiOperation({
    summary: '预热用户缓存',
    description: '预先加载常用用户数据到Redis缓存中',
  })
  @ApiResponse({ status: 200, description: '缓存预热成功' })
  async warmUpCache() {
    // 预热活跃用户缓存
    const activeUsers = await this.userService.findAll({
      active: 1,
      pageSize: 50,
    });

    // 将活跃用户信息缓存到Redis
    const cachePromises = activeUsers.map((user) =>
      this.cacheService.set(`user:${user.id}`, user, 600),
    );

    await Promise.all(cachePromises);

    // 预热用户统计信息
    await this.userService.getUserStats();

    return {
      code: 200,
      data: { count: activeUsers.length },
      message: `已预热 ${activeUsers.length} 个用户的缓存数据`,
    };
  }

  @Get('batch')
  @ApiOperation({
    summary: '批量获取用户信息',
    description: '根据用户ID数组批量获取用户信息，优先从缓存获取',
  })
  @ApiQuery({
    name: 'ids',
    description: '用户ID数组，逗号分隔',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: '批量获取用户成功', type: [User] })
  async getBatchUsers(@Query('ids') idsStr: string) {
    const ids = idsStr
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return {
        code: 200,
        data: [],
        message: '用户ID列表为空',
      };
    }

    const users = await this.userService.findByIds(ids);
    return {
      code: 200,
      data: users,
      message: `成功获取 ${users.length} 个用户信息`,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取用户',
    description: '根据用户ID获取用户详细信息，自动使用Redis缓存',
  })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  @ApiResponse({ status: 200, description: '获取用户成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get()
  @ApiOperation({
    summary: '获取用户列表',
    description: '获取所有用户列表，支持分页和筛选，自动使用Redis缓存',
  })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名筛选',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'active',
    description: '状态筛选',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'realtime',
    description: '是否实时查询（跳过缓存）',
    required: false,
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: '获取用户列表成功', type: [User] })
  getAllUser(@Query() query) {
    return wrapperResponse(this.userService.findAll(query), '获取用户列表成功');
  }

  @Post()
  @ApiOperation({
    summary: '创建用户',
    description: '创建新用户，自动清除相关缓存',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '创建用户成功', type: User })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() body: CreateUserDto) {
    return wrapperResponse(this.userService.create(body), '创建用户成功');
  }

  @Put()
  @ApiOperation({
    summary: '更新用户',
    description: '更新用户信息，自动更新相关缓存',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: '更新用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  update(@Body() body: CreateUserDto) {
    return wrapperResponse(this.userService.update(body), '更新用户成功');
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除用户',
    description: '根据ID删除用户，自动清除相关缓存',
  })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  @ApiResponse({ status: 200, description: '删除用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
