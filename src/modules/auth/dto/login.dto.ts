import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录请求DTO
 */
export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

/**
 * 用户信息DTO
 */
export class UserInfoDto {
  @ApiProperty({
    description: '用户ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: '角色',
    example: 'admin',
  })
  role: string;

  @ApiProperty({
    description: '昵称',
    example: '管理员',
  })
  nickname: string;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
  })
  avatar: string;
}

/**
 * 登录响应DTO
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: '用户信息',
    type: UserInfoDto,
  })
  user: UserInfoDto;
}
