import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 创建用户的数据传输对象
 * 用于验证用户创建请求的数据
 */
// 导出创建用户数据传输对象类
export class CreateUserDto {
  // 用户名，字符串类型，不能为空，错误信息为“用户名不能为空”
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  // 密码，字符串类型，不能为空，错误信息为“密码不能为空”
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  // 角色，字符串类型，不能为空，错误信息为“角色不能为空”
  @IsString()
  @IsNotEmpty({ message: '角色不能为空' })
  role: string;

  // 昵称，字符串类型，可选
  @IsString()
  @IsOptional()
  nickname?: string;

  // 头像，字符串类型，可选
  @IsString()
  @IsOptional()
  avatar?: string;
}
