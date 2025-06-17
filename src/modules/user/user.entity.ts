import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户实体
 * 对应数据库中的admin_user表
 */
@Entity('admin_user')
export class User {
  @ApiProperty({
    description: '用户ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  @Column()
  @Unique(['username'])
  username: string;

  @ApiProperty({
    description: '密码',
    example: '******',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
  })
  @Column()
  avatar: string;

  @ApiProperty({
    description: '角色',
    example: 'admin',
  })
  @Column()
  role: string;

  @ApiProperty({
    description: '昵称',
    example: '管理员',
  })
  @Column()
  nickname: string;

  @ApiProperty({
    description: '是否激活',
    example: 1,
  })
  @Column({ default: 1 })
  active: number;
}
