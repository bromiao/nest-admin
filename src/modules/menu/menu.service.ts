import { Injectable } from '@nestjs/common';
import { MENU_LIST } from './menu.data';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
  ) {}

  findAll() {
    const QUERY_ALL_SQL = 'SELECT * FROM menu ORDER BY id DESC';
    return this.menuRepository.query(QUERY_ALL_SQL);
    // return this.menuRepository.findBy({ active: 1 });
    // return new Promise((resolve) => {
    //   resolve(MENU_LIST);
    // });
  }

  findActive() {
    const QUERY_ALL_SQL =
      'SELECT * FROM menu WHERE active = 1 ORDER BY id DESC';
    return this.menuRepository.query(QUERY_ALL_SQL);
  }

  create(body) {
    return this.menuRepository.save(body);
  }

  update(body) {
    const id = body.data?.id || body.id;
    const data = body.data || body;
    return this.menuRepository.update(id, data);
  }
}
