import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CacheService } from '../cache/cache.service';
import { wrapperResponse } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('book')
@ApiBearerAuth('JWT-auth')
@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '获取电子书列表',
    description: '获取所有电子书列表，支持分页和筛选',
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
  @ApiResponse({ status: 200, description: '获取电子书列表成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getBookList(@Query() params, @Request() request) {
    const user = request.user;
    if (!user || !user.userid) {
      throw new UnauthorizedException('用户信息无效');
    }
    const { userid } = user;

    const cacheKey = `books:list:${userid}:${JSON.stringify(params)}`;

    try {
      // 尝试从缓存获取
      const cachedBooks = await this.cacheService.get<{
        data: any[];
        count: number;
      }>(cacheKey);
      if (cachedBooks) {
        return {
          code: 0,
          data: cachedBooks.data,
          count: cachedBooks.count,
          message: '获取电子书列表成功！（缓存）',
        };
      }

      // 从数据库获取并缓存
      const [books, count] = await Promise.all([
        this.bookService.getBookList(params, userid),
        this.bookService.countBookList(params, userid),
      ]);

      const result = { data: books, count };
      await this.cacheService.set(cacheKey, result, 300); // 缓存5分钟

      return {
        code: 0,
        data: books,
        count,
        message: '获取电子书列表成功！',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        count: 0,
        message: error.message || '获取电子书列表失败',
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取电子书',
    description: '根据电子书ID获取电子书详细信息',
  })
  @ApiParam({ name: 'id', description: '电子书ID', type: Number })
  @ApiResponse({ status: 200, description: '查询电子书成功' })
  @ApiResponse({ status: 404, description: '电子书不存在' })
  async getBook(@Param('id', ParseIntPipe) id) {
    const cacheKey = `book:${id}`;

    try {
      // 尝试从缓存获取
      const cachedBook = await this.cacheService.get(cacheKey);
      if (cachedBook) {
        return {
          code: 0,
          data: cachedBook,
          message: '查询电子书成功！（缓存）',
        };
      }

      // 从数据库获取并缓存
      const book = await this.bookService.getBook(id);
      if (!book) {
        return {
          code: -1,
          data: null,
          message: '电子书不存在',
        };
      }

      await this.cacheService.set(cacheKey, book, 600); // 缓存10分钟

      return {
        code: 0,
        data: book,
        message: '查询电子书成功！',
      };
    } catch (error) {
      return {
        code: -1,
        data: null,
        message: error.message || '查询电子书失败',
      };
    }
  }

  @Post()
  @ApiOperation({ summary: '添加电子书', description: '添加新电子书' })
  @ApiBody({ description: '电子书信息' })
  @ApiResponse({ status: 201, description: '添加电子书成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  insertBook(@Body() body) {
    return wrapperResponse(this.bookService.addBook(body), '添加电子书成功！');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传电子书', description: '上传电子书文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '电子书文件（.epub格式）',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '上传文件成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  uploadBook(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /epub/ })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    const destDir = 'upload';
    const destPath = path.resolve(destDir, file.originalname);
    fs.writeFileSync(destPath, file.buffer);

    return wrapperResponse(this.bookService.uploadBook(file), '上传文件成功！');
  }

  @Put()
  @ApiOperation({ summary: '更新电子书', description: '更新电子书信息' })
  @ApiBody({ description: '电子书信息' })
  @ApiResponse({ status: 200, description: '更新电子书成功' })
  @ApiResponse({ status: 404, description: '电子书不存在' })
  updateBook(@Body() body) {
    return wrapperResponse(
      this.bookService.updateBook(body),
      '更新电子书成功！',
    );
  }

  @Delete()
  @ApiOperation({ summary: '删除电子书', description: '删除电子书' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: '电子书ID',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '删除电子书成功' })
  @ApiResponse({ status: 404, description: '电子书不存在' })
  deleteBook(@Body() body) {
    return wrapperResponse(
      this.bookService.deleteBook(body.id),
      '删除电子书成功！',
    );
  }
}
