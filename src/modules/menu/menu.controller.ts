import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CacheService } from '../cache/cache.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('menu')
@ApiBearerAuth('JWT-auth')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('active')
  @ApiOperation({
    summary: '获取激活的菜单',
    description: '获取当前激活状态的菜单列表',
  })
  @ApiResponse({ status: 200, description: '获取菜单信息成功' })
  async getActiveMenu() {
    const cacheKey = 'menus:active';

    try {
      // 尝试从缓存获取
      const cachedMenus = await this.cacheService.get(cacheKey);
      if (cachedMenus) {
        return {
          code: 0,
          data: cachedMenus,
          message: '获取菜单信息成功（缓存）',
        };
      }

      // 从数据库获取并缓存
      const menus = await this.menuService.findActive();
      await this.cacheService.set(cacheKey, menus, 600); // 缓存10分钟

      return {
        code: 0,
        data: menus,
        message: '获取菜单信息成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '获取菜单信息失败',
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取菜单',
    description: '根据菜单ID获取菜单详细信息',
  })
  @ApiParam({ name: 'id', description: '菜单ID', type: Number })
  @ApiResponse({ status: 200, description: '获取菜单成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async getMenu(@Param('id', ParseIntPipe) id: number) {
    const cacheKey = `menu:${id}`;

    try {
      // 尝试从缓存获取
      const cachedMenu = await this.cacheService.get(cacheKey);
      if (cachedMenu) {
        return {
          code: 0,
          data: cachedMenu,
          message: '获取菜单成功（缓存）',
        };
      }

      // 从数据库获取并缓存 - 使用原生查询
      const menu = await this.menuService.findById(id);
      if (!menu) {
        return {
          code: -1,
          data: null,
          message: '菜单不存在',
        };
      }

      await this.cacheService.set(cacheKey, menu, 300); // 缓存5分钟

      return {
        code: 0,
        data: menu,
        message: '获取菜单成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '获取菜单失败',
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: '获取所有菜单',
    description: '获取系统中所有菜单列表',
  })
  @ApiResponse({ status: 200, description: '获取菜单列表成功' })
  async getAllMenu() {
    const cacheKey = 'menus:all';

    try {
      // 尝试从缓存获取
      const cachedMenus = await this.cacheService.get(cacheKey);
      if (cachedMenus) {
        return {
          code: 0,
          data: cachedMenus,
          message: '获取菜单列表成功（缓存）',
        };
      }

      // 从数据库获取并缓存
      const menus = await this.menuService.findAll();
      await this.cacheService.set(cacheKey, menus, 300); // 缓存5分钟

      return {
        code: 0,
        data: menus,
        message: '获取菜单列表成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '获取菜单列表失败',
      };
    }
  }

  @Post()
  @ApiOperation({ summary: '创建菜单', description: '创建新菜单' })
  @ApiBody({ description: '菜单信息' })
  @ApiResponse({ status: 201, description: '菜单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() body) {
    try {
      const menu = await this.menuService.create(body.data || body);

      // 清除相关缓存
      await this.clearMenuCaches();

      return {
        code: 0,
        data: menu,
        message: '菜单创建成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '菜单创建失败',
      };
    }
  }

  @Put()
  @ApiOperation({ summary: '更新菜单', description: '更新菜单信息' })
  @ApiBody({ description: '菜单信息' })
  @ApiResponse({ status: 200, description: '菜单更新成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async update(@Body() body) {
    try {
      const result = await this.menuService.update(body.data || body);

      // 清除相关缓存
      await this.clearMenuCaches();
      const menuId = body.data?.id || body.id;
      if (menuId) {
        await this.cacheService.delete(`menu:${menuId}`);
      }

      return {
        code: 0,
        data: result,
        message: '菜单更新成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '菜单更新失败',
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单', description: '根据ID删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: Number })
  @ApiResponse({ status: 200, description: '删除菜单成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.menuService.deleteById(id);

      // 清除相关缓存
      await this.clearMenuCaches();
      await this.cacheService.delete(`menu:${id}`);

      return {
        code: 0,
        data: null,
        message: '删除菜单成功',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '删除菜单失败',
      };
    }
  }

  /**
   * 清除菜单相关缓存
   */
  private async clearMenuCaches() {
    await Promise.all([
      this.cacheService.delete('menus:all'),
      this.cacheService.delete('menus:active'),
    ]);
  }
}
