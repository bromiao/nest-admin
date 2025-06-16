import { Injectable, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './crate-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user ?? ({} as User);
  }

  findAll(query): Promise<User[]> {
    let where = 'WHERE 1=1';
    if (query.id) {
      where += ` AND id='${query.id}'`;
    }
    if (query.username) {
      where += ` AND username='${query.username}'`;
    }
    if (query.active) {
      where += ` AND active='${query.active}'`;
    }
    let page = +query.page || 1;
    let pageSize = +query.pageSize || 20;
    if (page < 1) {
      page = 1;
    }
    if (pageSize < 1) {
      pageSize = 20;
    }
    const QUERY_ALl_USER_SQL = `SELECT id, username, avatar, role, nickname, active FROM admin_user ${where}`;
    return this.userRepository.query(QUERY_ALl_USER_SQL);
  }

  create(createUserDao: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDao);
    return this.userRepository.save(user);
  }

  update(params) {
    const { username, nickname, active, role } = params;
    const SET_SQL: string[] = [];
    if (nickname) {
      SET_SQL.push(`nickname='${nickname}'`);
    }
    if (active) {
      SET_SQL.push(`active='${active}'`);
    }
    if (role) {
      SET_SQL.push(`role=${JSON.stringify(role)}`);
    }
    const UPDATE_SQL = `UPDATE admin_user SET ${SET_SQL.join(',')} WHERE username='${username}'`;
    return this.userRepository.query(UPDATE_SQL);
  }

  remove(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    return user || ({} as User);
  }
}
