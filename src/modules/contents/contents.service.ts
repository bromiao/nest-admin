import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contents } from './contents.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

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
  countContentsList(params: any = {}) {
    const { title = '', author = '' } = params;
    let where = 'WHERE 1=1';
    if (title) {
      where += ` AND title LIKE '%${title}%'`;
    }
    if (author) {
      where += ` AND author LIKE '%${author}%'`;
    }
    const QUERY_BOOK_LIST_SQL = `SELECT count(*) AS count FROM contents ${where}`;
    return this.contentsRepository.query(QUERY_BOOK_LIST_SQL);
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
