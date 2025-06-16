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
import { wrapperCountResponse, wrapperResponse } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  getBookList(@Query() params, @Request() request) {
    const user = request.user;
    if (!user || !user.userid) {
      throw new UnauthorizedException('用户信息无效');
    }
    const { userid } = user;
    return wrapperCountResponse(
      this.bookService.getBookList(params, userid),
      this.bookService.countBookList(params, userid),
      '获取电子书列表成功！',
    );
  }

  @Get(':id')
  getBook(@Param('id', ParseIntPipe) id) {
    return wrapperResponse(this.bookService.getBook(id), '查询电子书成功！');
  }

  @Post()
  insertBook(@Body() body) {
    return wrapperResponse(this.bookService.addBook(body), '添加电子书成功！');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
  updateBook(@Body() body) {
    return wrapperResponse(
      this.bookService.updateBook(body),
      '更新电子书成功！',
    );
  }

  @Delete()
  deleteBook(@Body() body) {
    return wrapperResponse(
      this.bookService.deleteBook(body.id),
      '删除电子书成功！',
    );
  }
}
