import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ContentsAdapterService } from './contents-adapter.service';
import { wrapperCountResponse, wrapperResponse } from 'src/utils';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('contents')
@ApiBearerAuth('JWT-auth')
@Controller('contents')
export class ContentsController {
  constructor(
    private readonly contentsAdapterService: ContentsAdapterService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '获取目录列表',
    description: '获取所有目录列表，支持分页和筛选',
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
  @ApiResponse({ status: 200, description: '获取目录列表成功' })
  getContentsList(@Query() params) {
    return wrapperCountResponse(
      this.contentsAdapterService.getContentsList(params),
      this.contentsAdapterService.countContentsList(params),
      '获取目录列表成功！',
    );
  }

  @Post()
  @ApiOperation({ summary: '新增目录', description: '创建新目录' })
  @ApiBody({ description: '目录信息' })
  @ApiResponse({ status: 201, description: '新增目录成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  insertContents(@Body() body) {
    return wrapperResponse(
      this.contentsAdapterService.addContents(body),
      '新增目录成功！',
    );
  }

  @Delete()
  @ApiOperation({ summary: '删除目录', description: '删除电子书目录' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          description: '文件名',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '删除电子书目录成功' })
  @ApiResponse({ status: 404, description: '目录不存在' })
  deleteContents(@Body() body) {
    return wrapperResponse(
      this.contentsAdapterService.deleteContents(body.fileName),
      '删除电子书目录成功！',
    );
  }
}
