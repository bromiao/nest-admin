import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('menu')
@Unique(['name', 'path'])
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  name: string;

  @Column({ default: '' })
  redirect: string;

  @Column()
  meta: string;

  @Column()
  pid: number;

  @Column({ default: 1 })
  active: number;
}
