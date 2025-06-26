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
} from '@nestjs/common';
import { RoleAdapterService } from './role-adapter.service';
import { CacheService } from '../cache/cache.service';
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

@ApiTags('role')
@ApiBearerAuth('JWT-auth')
@Controller('role')
export class RoleController {
  constructor(
    private readonly roleAdapterService: RoleAdapterService,
    private readonly cacheService: CacheService,
  ) {}

  @Delete('role_menu')
  @ApiOperation({
    summary: '删除角色菜单关系',
    description: '删除角色和菜单的绑定关系',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: {
          type: 'number',
          description: '角色ID',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '删除角色和菜单绑定关系成功' })
  removeRoleMenu(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.removeRoleMenu(body.roleId),
      '删除角色和菜单绑定关系成功',
    );
  }

  @Delete('role_auth')
  @ApiOperation({
    summary: '删除角色权限关系',
    description: '删除角色和权限的绑定关系',
  })
  @ApiBody({ description: '角色权限关系信息' })
  @ApiResponse({ status: 200, description: '删除角色和权限绑定关系成功' })
  removeRoleAuth(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.removeRoleAuth(body),
      '删除角色和权限绑定关系成功',
    );
  }

  @Delete('auth')
  @ApiOperation({
    summary: '删除权限',
    description: '删除指定ID的权限',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: '权限ID',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '删除权限成功' })
  removeAuth(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.removeAuth(body.id),
      '删除权限成功',
    );
  }

  @Get('auth')
  @ApiOperation({
    summary: '获取权限列表',
    description: '获取所有权限列表，支持筛选',
  })
  @ApiResponse({ status: 200, description: '获取权限列表数据成功' })
  async getAuthList(@Query() query) {
    const cacheKey = `roles:auth:${JSON.stringify(query)}`;

    try {
      // 尝试从缓存获取
      const cachedAuth = await this.cacheService.get(cacheKey);
      if (cachedAuth) {
        return {
          code: 0,
          data: cachedAuth,
          message: '获取权限列表数据成功（缓存）',
        };
      }

      // 从数据库获取并缓存
      const authList = await this.roleAdapterService.getAuthList(query);
      await this.cacheService.set(cacheKey, authList, 600); // 缓存10分钟

      return {
        code: 0,
        data: authList,
        message: '获取权限列表数据成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '获取权限列表失败',
      };
    }
  }

  @Post('auth')
  @ApiOperation({
    summary: '创建权限',
    description: '创建新权限',
  })
  @ApiBody({ description: '权限信息' })
  @ApiResponse({ status: 201, description: '新增权限成功' })
  createAuth(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.createAuth(body),
      '新增权限成功',
    );
  }

  @Put('auth')
  @ApiOperation({
    summary: '更新权限',
    description: '更新权限信息',
  })
  @ApiBody({ description: '权限信息' })
  @ApiResponse({ status: 200, description: '更新权限成功' })
  updateAuth(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.updateAuth(body),
      '更新权限成功',
    );
  }

  @Get()
  @ApiOperation({
    summary: '获取角色列表',
    description: '获取所有角色列表，支持筛选',
  })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  async getAllRole(@Query() query) {
    const cacheKey = `roles:all:${JSON.stringify(query)}`;

    try {
      // 尝试从缓存获取
      const cachedRoles = await this.cacheService.get(cacheKey);
      if (cachedRoles) {
        return {
          code: 0,
          data: cachedRoles,
          message: '获取角色列表成功（缓存）',
        };
      }

      // 从数据库获取并缓存
      const roles = await this.roleAdapterService.findAll();
      await this.cacheService.set(cacheKey, roles, 300); // 缓存5分钟

      return {
        code: 0,
        data: roles,
        message: '获取角色列表成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '获取角色列表失败',
      };
    }
  }

  @Post()
  @ApiOperation({
    summary: '创建角色',
    description: '创建新角色',
  })
  @ApiBody({ description: '角色信息' })
  @ApiResponse({ status: 201, description: '创建角色成功' })
  create(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.create(body),
      '创建角色成功',
    );
  }

  @Put()
  @ApiOperation({
    summary: '更新角色',
    description: '更新角色信息',
  })
  @ApiBody({ description: '角色信息' })
  @ApiResponse({ status: 200, description: '更新角色成功' })
  update(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.update(body),
      '更新角色成功',
    );
  }

  @Post('role_menu')
  @ApiOperation({
    summary: '创建角色菜单关系',
    description: '创建角色和菜单的绑定关系',
  })
  @ApiBody({ description: '角色菜单关系信息' })
  @ApiResponse({ status: 201, description: '新增角色和菜单绑定关系成功' })
  createRoleMenu(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.createRoleMenu(body),
      '新增角色和菜单绑定关系成功',
    );
  }

  @Get('role_menu')
  @ApiOperation({
    summary: '获取角色菜单关系',
    description: '获取角色和菜单的绑定关系',
  })
  @ApiQuery({ name: 'roleId', description: '角色ID', type: Number })
  @ApiResponse({ status: 200, description: '获取角色和菜单绑定关系成功' })
  getRoleMenu(@Query('roleId') roleId: number | string) {
    const id = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
    return wrapperResponse(
      this.roleAdapterService.getRoleMenu(id),
      '获取角色和菜单绑定关系成功',
    );
  }

  @Post('role_auth')
  @ApiOperation({
    summary: '创建角色权限关系',
    description: '创建角色和权限的绑定关系',
  })
  @ApiBody({ description: '角色权限关系信息' })
  @ApiResponse({ status: 201, description: '新增角色和权限绑定关系成功' })
  createRoleAuth(@Body() body) {
    return wrapperResponse(
      this.roleAdapterService.createRoleAuth(body),
      '新增角色和权限绑定关系成功',
    );
  }

  @Get('role_auth')
  @ApiOperation({
    summary: '获取角色权限关系',
    description: '获取角色和权限的绑定关系',
  })
  @ApiQuery({ name: 'roleId', description: '角色ID', type: Number })
  @ApiResponse({ status: 200, description: '获取角色和权限绑定关系成功' })
  getRoleAuth(@Query('roleId') roleId: number | string) {
    const id = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
    return wrapperResponse(
      this.roleAdapterService.getRoleAuth(id),
      '获取角色和权限绑定关系成功',
    );
  }

  @Get('role_auth/get_auth_by_role')
  @ApiOperation({
    summary: '根据角色名获取权限',
    description: '根据角色名获取角色和权限的绑定关系',
  })
  @ApiQuery({ name: 'roleName', description: '角色名称', type: String })
  @ApiResponse({ status: 200, description: '获取角色和权限绑定关系成功' })
  getRoleAuthByRoleName(@Query('roleName') roleName: string) {
    return wrapperResponse(
      this.roleAdapterService.getRoleAuthByRoleName(roleName),
      '获取角色和权限绑定关系成功',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取角色',
    description: '根据角色ID获取角色详细信息',
  })
  @ApiParam({ name: 'id', description: '角色ID', type: Number })
  @ApiResponse({ status: 200, description: '获取角色成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  getRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleAdapterService.findOne(id);
  }
}
