import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async findOne(id: number): Promise<Role> {
    const Role = await this.roleRepository.findOneBy({ id });
    return Role ?? ({} as Role);
  }

  findAll(): Promise<Role[]> {
    const QUERY_ALl_ROLE_SQL = `SELECT id, name, remark FROM role`;
    return this.roleRepository.query(QUERY_ALl_ROLE_SQL);
  }

  create(params) {
    const role = new Role();
    role.name = params.name;
    role.remark = params.remark;
    return this.roleRepository.save(role);
  }

  update(params) {
    const { name, remark, id } = params;
    const SET_SQL: string[] = [];
    if (name || remark) {
      name && SET_SQL.push(`name='${name}'`);
      remark && SET_SQL.push(`remark='${remark}'`);
      const UPDATE_SQL = `UPDATE role SET ${SET_SQL.join(',')} WHERE id='${id}'`;
      return this.roleRepository.query(UPDATE_SQL);
    }
    return Promise.resolve({});
  }

  async createRoleMenu(params) {
    const { roleId, menuId } = params;
    const INSERT_SQL = `INSERT INTO role_menu(roleId, menuId) VALUES('${roleId}', '${menuId}')`;
    // 建立 roleId 和 menuId 的绑定关系
    const ret = await this.roleRepository.query(INSERT_SQL);
    // 查询 menu 信息
    const menuList = await this.roleRepository.query(
      `SELECT * FROM menu WHERE id='${menuId}'`,
    );
    const roleList = await this.roleRepository.query(
      `SELECT * FROM role WHERE id='${roleId}'`,
    );
    const [menu] = menuList || [];
    const [role] = roleList || [];
    if (menu && role) {
      let { meta } = menu;
      meta = JSON.parse(meta) || {};
      let flag = true;
      if (meta.roles && meta.roles.length > 0) {
        if (!meta.roles.includes(role.name)) {
          const roles = JSON.parse(meta.roles);
          roles.push(role.name);
          meta.roles = JSON.stringify(roles);
          flag = false;
        }
      } else {
        meta.roles = JSON.stringify([role.name]);
      }

      if (flag) {
        meta.roles = meta.roles.replaceAll('"', '\\"');
        meta = JSON.stringify(meta);
        // 保存新的meta信息
        await this.roleRepository.query(
          `UPDATE menu SET meta='${meta}' WHERE id='${menuId}'`,
        );
      }
    }
    return ret;
  }

  async createRoleAuth(params) {
    const { roleId, authId } = params;
    const INSERT_SQL = `INSERT INTO role_auth(roleId, authId) VALUES('${roleId}', '${authId}')`;
    return this.roleRepository.query(INSERT_SQL);
  }

  getRoleMenu(roleId) {
    const QUERY_ROLE_MENU_SQL = `SELECT roleId, menuId FROM role_menu WHERE roleId='${roleId}'`;
    return this.roleRepository.query(QUERY_ROLE_MENU_SQL);
  }

  getRoleAuth(roleId) {
    const QUERY_ROLE_MENU_SQL = `SELECT roleId, authId FROM role_auth WHERE roleId='${roleId}'`;
    return this.roleRepository.query(QUERY_ROLE_MENU_SQL);
  }

  async getRoleAuthByRoleName(roleName) {
    roleName = JSON.parse(roleName);
    roleName = roleName.map((role) => `'${role}'`).join(',');
    const where = `WHERE 1=1 AND name IN (${roleName})`;
    const QUERY_ROLE_LIST_SQL = `SELECT id, name FROM role ${where}`;
    const roleList = await this.roleRepository.query(QUERY_ROLE_LIST_SQL);
    const roleIds = roleList.map((role) => role.id);
    const authWhere = `WHERE 1=1 AND roleId IN (${roleIds.join(',')})`;
    const QUERY_ROLE_AUTH_SQL = `SELECT roleId, authId FROM role_auth ${authWhere}`;
    const authList = await this.roleRepository.query(QUERY_ROLE_AUTH_SQL);

    // 去重authId
    const authIds = [...new Set(authList.map((auth) => auth.authId))];

    if (authIds.length === 0) {
      return authIds;
    }
    const authInfo = await this.roleRepository.query(
      `SELECT * FROM auth WHERE id IN (${authIds.join(',')})`,
    );
    return authInfo;
  }

  getAuthList(query) {
    const { key } = query;
    let where = '1=1';
    if (key) {
      where += ` AND \`key\` LIKE '%${key}%'`;
    }
    const QUERY_AUTH_LIST_SQL = `SELECT * FROM auth WHERE ${where}`;
    return this.roleRepository.query(QUERY_AUTH_LIST_SQL);
  }

  createAuth(params) {
    const { key = '', name = '', remark = '' } = params;
    const INSERT_SQL = `INSERT INTO auth(
      \`key\`,
      name,
      remark
    ) VALUES(
      "${key}", 
      "${name}", 
      "${remark}"
     )`;

    return this.roleRepository.query(INSERT_SQL);
  }

  updateAuth(params) {
    const { name, remark, id } = params;
    const SET_SQL: string[] = [];
    if (name || remark) {
      name && SET_SQL.push(`name='${name}'`);
      remark && SET_SQL.push(`remark='${remark}'`);
      const UPDATE_SQL = `UPDATE auth SET ${SET_SQL.join(',')} WHERE id='${id}'`;
      return this.roleRepository.query(UPDATE_SQL);
    }
    return Promise.resolve({});
  }

  removeRoleMenu(roleId) {
    if (roleId) {
      const DELETE_SQL = `DELETE FROM role_menu WHERE roleId='${roleId}'`;
      return this.roleRepository.query(DELETE_SQL);
    }
    return Promise.resolve({});
  }

  removeRoleAuth(body) {
    if (body.roleId) {
      const DELETE_SQL = `DELETE FROM role_auth WHERE roleId='${body.roleId}'`;
      return this.roleRepository.query(DELETE_SQL);
    } else if (body.authId) {
      const DELETE_SQL = `DELETE FROM role_auth WHERE authId='${body.authId}'`;
      return this.roleRepository.query(DELETE_SQL);
    }
    return Promise.resolve({});
  }

  removeAuth(authId) {
    if (authId) {
      const DELETE_SQL = `DELETE FROM auth WHERE id='${authId}'`;
      return this.roleRepository.query(DELETE_SQL);
    }
    return Promise.resolve({});
  }

  remove(id: number): Promise<DeleteResult> {
    return this.roleRepository.delete(id);
  }
}
