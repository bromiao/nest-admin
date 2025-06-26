import { UserAdapterService } from '../user/user-adapter.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as md5 from 'md5';
import { LoggerService } from '../logger/logger.service';

/**
 * 认证服务
 * 处理用户登录和JWT令牌生成
 */
@Injectable()
export class AuthService {
  constructor(
    private userAdapterService: UserAdapterService,
    private jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('AuthService');
  }

  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns JWT令牌和用户信息
   */
  async login(username: string, password: string) {
    try {
      // 查找用户
      const user = await this.userAdapterService.findByUsername(username);

      if (!user) {
        this.logger.warn(`User not found: ${username}`);
        throw new UnauthorizedException('用户名或密码错误');
      }

      // 验证密码
      const md5Pwd = md5(password).toUpperCase();

      this.logger.debug(`Attempting login for user: ${username}`);

      if (user.password !== md5Pwd) {
        this.logger.warn(`Invalid password attempt for user: ${username}`);
        throw new UnauthorizedException('用户名或密码错误');
      }

      // 生成JWT令牌
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname,
      };

      const token = await this.jwtService.signAsync(payload);

      this.logger.log(`User ${username} logged in successfully`);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
