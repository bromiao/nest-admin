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
import { wrapperResponse } from 'src/utils';
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
  constructor(private readonly menuService: MenuService) {}

  @Get('active')
  @ApiOperation({
    summary: '获取激活的菜单',
    description: '获取当前激活状态的菜单列表',
  })
  @ApiResponse({ status: 200, description: '获取菜单信息成功' })
  getActiveMenu() {
    return wrapperResponse(this.menuService.findActive(), '获取菜单信息成功');
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取菜单',
    description: '根据菜单ID获取菜单详细信息',
  })
  @ApiParam({ name: 'id', description: '菜单ID', type: Number })
  @ApiResponse({ status: 200, description: '获取菜单成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  getMenu(@Param('id', ParseIntPipe) id: number) {
    // 注意：此方法实现为空，可能需要实现或删除
    return { message: '此功能尚未实现' };
  }

  @Get()
  @ApiOperation({
    summary: '获取所有菜单',
    description: '获取系统中所有菜单列表',
  })
  @ApiResponse({ status: 200, description: '获取菜单列表成功' })
  getAllMenu() {
    return wrapperResponse(this.menuService.findAll(), '获取菜单列表成功');
  }

  @Post()
  @ApiOperation({ summary: '创建菜单', description: '创建新菜单' })
  @ApiBody({ description: '菜单信息' })
  @ApiResponse({ status: 201, description: '菜单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() body) {
    return wrapperResponse(
      this.menuService.create(body.data || body),
      '菜单创建成功',
    );
  }

  @Put()
  @ApiOperation({ summary: '更新菜单', description: '更新菜单信息' })
  @ApiBody({ description: '菜单信息' })
  @ApiResponse({ status: 200, description: '菜单更新成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  update(@Body() body) {
    return wrapperResponse(
      this.menuService.update(body.data || body),
      '菜单更新成功',
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单', description: '根据ID删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: Number })
  @ApiResponse({ status: 200, description: '删除菜单成功' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    // 注意：此方法实现为空，可能需要实现或删除
    return { message: '此功能尚未实现' };
  }
}
