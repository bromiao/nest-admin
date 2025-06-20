import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contents } from './contents.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Contents)
    private readonly contentsRepository: Repository<Contents>,
  ) {}

  getContentsList(params: any = {}) {
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
    const QUERY_BOOK_LIST_SQL = `SELECT * FROM contents ${where} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
    return this.contentsRepository.query(QUERY_BOOK_LIST_SQL);
  }
  /**
   * 获取内容列表数量
   * 使用Repository.count()方法，直接返回数字
   */
  async countContentsList(params: any = {}): Promise<number> {
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

    // 根据是否有查询条件决定查询方式
    if (Object.keys(whereConditions).length > 0) {
      return await this.contentsRepository.count({ where: whereConditions });
    } else {
      return await this.contentsRepository.count(); // 不传where参数
    }
  }

  addContents(params) {
    const { fileName, id, href, order, level, text, label, pid, navId } =
      params;
    const INSERT_SQL = `INSERT INTO contents(
      fileName, 
      id,
      href,
      \`order\`,
      level,
      text,
      label,
      pid,
      navId
    ) VALUES(
      '${fileName}', 
      "${id}", 
      "${href}", 
      "${order}", 
      "${level}", 
      "${text}", 
      "${label}", 
      "${pid}", 
      "${navId}"
     )`;

    return this.contentsRepository.query(INSERT_SQL);
  }

  async deleteContents(fileName) {
    const DELETE_SQL = `DELETE FROM contents WHERE fileName="${fileName}"`;
    return this.contentsRepository.query(DELETE_SQL);
  }
}
