import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository, Like, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EpubBook } from './epub-book';
import { NGINX_PATH } from 'src/constants/auth.constants';

const homeDir = os.homedir();
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
    console.log(2222, authList);
    let categoryAuth = authList.filter((auth) => AUTH_LIST.includes(auth.key));

    // 对于Repository方法，返回不带引号的字符串数组
    categoryAuth = categoryAuth.map((category) => category.key);
    return categoryAuth;
  }

  /**
   * 获取用户权限分类（用于原生SQL）
   * 返回带引号的字符串数组，用于SQL IN子句
   */
  async getCategoryAuthForSQL(userid) {
    const categoryAuth = await this.getCategoryAuth(userid);
    return categoryAuth.map((category) => `'${category}'`);
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
    const categoryAuth = await this.getCategoryAuthForSQL(userid);
    console.log(1111, categoryAuth);
    if (categoryAuth.length > 0) {
      where += ` AND categoryText IN (${categoryAuth.join(',')})`;
    }
    const QUERY_BOOK_LIST_SQL = `SELECT * FROM book ${where} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
    return this.bookRepository.query(QUERY_BOOK_LIST_SQL);
  }
  /**
   * 获取图书列表数量
   * 使用Repository.count()方法，直接返回数字
   */
  async countBookList(params: any = {}, userid): Promise<number> {
    const { title = '', author = '' } = params;

    // 构建查询条件对象
    const whereConditions: any = {};

    // 添加标题筛选
    if (title) {
      whereConditions.title = Like(`%${title}%`);
    }

    // 添加作者筛选
    if (author) {
      whereConditions.author = Like(`%${author}%`);
    }

    // 获取用户权限分类
    const categoryAuth = await this.getCategoryAuth(userid);
    if (categoryAuth.length > 0) {
      whereConditions.categoryText = In(categoryAuth);
    }

    // 根据是否有查询条件决定查询方式
    if (Object.keys(whereConditions).length > 0) {
      return await this.bookRepository.count({ where: whereConditions });
    } else {
      return await this.bookRepository.count(); // 不传where参数
    }
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
    // const destDir = '/opt/homebrew/var/www/upload';
    const destPath = path.resolve(homeDir, NGINX_PATH, file.originalname);
    fs.writeFileSync(destPath, file.buffer);

    return this.parseBook(destPath, file).then((data) => {
      return {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: destPath,
        dir: path.resolve(homeDir, NGINX_PATH),
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

  // 以下方法为适配器模式新增的标准化方法

  /**
   * 创建书籍 - 标准化方法
   */
  async create(bookData: Partial<Book>): Promise<Book> {
    const book = this.bookRepository.create({
      ...bookData,
      createDatetime: Date.now(),
      updateDatetime: Date.now(),
    });
    return await this.bookRepository.save(book);
  }

  /**
   * 查找所有书籍 - 标准化方法
   */
  async findAll(): Promise<Book[]> {
    return await this.bookRepository.find({
      order: { id: 'DESC' },
    });
  }

  /**
   * 根据ID查找书籍 - 标准化方法
   */
  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new Error(`书籍ID ${id} 不存在`);
    }
    return book;
  }

  /**
   * 根据文件名查找书籍 - 标准化方法
   */
  async findByFileName(fileName: string): Promise<Book | null> {
    return await this.bookRepository.findOne({ where: { fileName } });
  }

  /**
   * 更新书籍 - 标准化方法
   */
  async update(id: number, updateData: Partial<Book>): Promise<Book> {
    await this.findOne(id); // 检查是否存在
    await this.bookRepository.update(id, {
      ...updateData,
      updateDatetime: Date.now(),
    });
    return await this.findOne(id);
  }

  /**
   * 删除书籍 - 标准化方法
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // 检查是否存在
    await this.bookRepository.delete(id);
  }

  /**
   * 获取书籍总数 - 标准化方法
   */
  async count(): Promise<number> {
    return await this.bookRepository.count();
  }

  /**
   * 分页查询书籍 - 标准化方法
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.bookRepository.find({
        skip,
        take: limit,
        order: { id: 'DESC' },
      }),
      this.bookRepository.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据分类查找书籍 - 标准化方法
   */
  async findByCategory(category: number): Promise<Book[]> {
    return await this.bookRepository.find({
      where: { category },
      order: { id: 'DESC' },
    });
  }

  /**
   * 搜索书籍 - 标准化方法
   */
  async search(keyword: string): Promise<Book[]> {
    return await this.bookRepository.find({
      where: [
        { title: Like(`%${keyword}%`) },
        { author: Like(`%${keyword}%`) },
        { publisher: Like(`%${keyword}%`) },
      ],
      order: { id: 'DESC' },
    });
  }

  /**
   * 批量删除书籍 - 标准化方法
   */
  async removeMany(ids: number[]): Promise<void> {
    await this.bookRepository.delete(ids);
  }
}
