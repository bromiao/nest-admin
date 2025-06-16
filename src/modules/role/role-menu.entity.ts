import {
  Column,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('role_menu')
export class Role {
  @PrimaryColumn()
  roleId: number;

  @PrimaryColumn()
  menuId: number;
}
