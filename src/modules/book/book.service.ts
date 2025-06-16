import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { EpubBook } from './epub-book';

const AUTH_LIST = ['BusinessandManagement'];

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  getBook(id) {
    const QUERY_BOOK_SQL = `SELECT * FROM book WHERE id='${id}'`;
    return this.bookRepository.query(QUERY_BOOK_SQL);
  }

  async getCategoryAuth(userid) {
    // 获取用户对应权限
    const USER_SQL = `SELECT * FROM admin_user WHERE id='${userid}'`;
    const user = await this.bookRepository.query(USER_SQL);
    let [{ role }] = user;
    role = JSON.parse(role);
    role = role.map((item) => `'${item}'`);
    const AUTH_SQL = `
         SELECT * FROM auth WHERE id IN (
           SELECT DISTINCT authId FROM role_auth WHERE roleId IN (
             SELECT id FROM role WHERE \`name\` IN (${role.join(',')})
           )
         )
     `;
    const authList = await this.bookRepository.query(AUTH_SQL);
    let categoryAuth = authList.filter((auth) => AUTH_LIST.includes(auth.key));
    categoryAuth = categoryAuth.map((category) => `'${category.key}'`);
    return categoryAuth;
  }

  async getBookList(params: any = {}, userid) {
    let page = +params.page || 1;
    let pageSize = +params.pageSize || 20;
    const { title = '', author = '' } = params;
    if (page < 1) {
      page = 1;
    }
    if (pageSize < 1) {
      pageSize = 20;
    }
    let where = 'WHERE 1=1';
    if (title) {
      where += ` AND title LIKE '%${title}%'`;
    }
    if (author) {
      where += ` AND author LIKE '%${author}%'`;
    }
    const categoryAuth = await this.getCategoryAuth(userid);
    if (categoryAuth.length > 0) {
      where += ` AND categoryText IN (${categoryAuth.join(',')})`;
    }
    const QUERY_BOOK_LIST_SQL = `SELECT * FROM book ${where} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
    return this.bookRepository.query(QUERY_BOOK_LIST_SQL);
  }
  async countBookList(params: any = {}, userid) {
    const { title = '', author = '' } = params;
    let where = 'WHERE 1=1';
    if (title) {
      where += ` AND title LIKE '%${title}%'`;
    }
    if (author) {
      where += ` AND author LIKE '%${author}%'`;
    }
    const categoryAuth = await this.getCategoryAuth(userid);
    if (categoryAuth.length > 0) {
      where += ` AND categoryText IN (${categoryAuth.join(',')})`;
    }
    const QUERY_BOOK_LIST_SQL = `SELECT count(*) AS count FROM book ${where}`;
    return this.bookRepository.query(QUERY_BOOK_LIST_SQL);
  }

  addBook(params) {
    const {
      title,
      author,
      fileName,
      category,
      categoryText,
      cover,
      language,
      publisher,
      rootFile,
    } = params;
    const INSERT_SQL = `INSERT INTO book(
      fileName, 
      title, 
      author, 
      bookId, 
      category,
      categoryText, 
      cover, 
      language, 
      publisher, 
      rootFile
    ) VALUES(
      '${fileName}', 
      "${title}", 
      "${author}", 
      "${fileName}", 
      "${category}", 
      "${categoryText}", 
      "${cover}", 
      "${language}", 
      "${publisher}", 
      "${rootFile}"
     )`;

    return this.bookRepository.query(INSERT_SQL);
  }

  uploadBook(file) {
    const destDir = 'upload';
    const destPath = path.resolve(destDir, file.originalname);
    fs.writeFileSync(destPath, file.buffer);

    return this.parseBook(destPath, file).then((data) => {
      return {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: destPath,
        data,
      };
    });
  }

  parseBook(bookPath, file) {
    const epub = new EpubBook(bookPath, file);
    return epub.parse();
  }

  updateBook(params) {
    const { id, title, author, category, categoryText, language, publisher } =
      params;
    const updateFieldsData = {
      title,
      author,
      category,
      categoryText,
      language,
      publisher,
    };
    const SET_SQL: string[] = [];
    for (const key in updateFieldsData) {
      if (updateFieldsData[key]) {
        SET_SQL.push(`${key}='${updateFieldsData[key]}'`);
      }
    }
    const UPDATE_SQL = `UPDATE book SET ${SET_SQL.join(',')} WHERE id=${id}`;

    return this.bookRepository.query(UPDATE_SQL);
  }

  deleteBook(id) {
    const DELETE_SQL = `DELETE FROM book WHERE id=${id}`;
    return this.bookRepository.query(DELETE_SQL);
  }
}
