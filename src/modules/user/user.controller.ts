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

@ApiTags('user')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '根据JWT令牌获取当前登录用户信息',
  })
  @ApiResponse({ status: 200, description: '获取用户信息成功', type: User })
  @ApiResponse({ status: 401, description: '未授权' })
  getUserByToken(@Req() request) {
    return wrapperResponse(
      this.userService.findByUsername(request.user.username),
      '获取用户信息成功',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取用户',
    description: '根据用户ID获取用户详细信息',
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
    description: '获取所有用户列表，支持分页和筛选',
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
  @ApiResponse({ status: 200, description: '获取用户列表成功', type: [User] })
  getAllUser(@Query() query) {
    return wrapperResponse(this.userService.findAll(query), '获取用户列表成功');
  }

  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建新用户' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '创建用户成功', type: User })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() body: CreateUserDto) {
    return wrapperResponse(this.userService.create(body), '创建用户成功');
  }

  @Put()
  @ApiOperation({ summary: '更新用户', description: '更新用户信息' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: '更新用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  update(@Body() body: CreateUserDto) {
    return wrapperResponse(this.userService.update(body), '更新用户成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户', description: '根据ID删除用户' })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  @ApiResponse({ status: 200, description: '删除用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
