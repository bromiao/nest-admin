import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET_KEY } from 'src/constants/auth.constants';
import { Request } from 'express';

/**
 * 认证守卫
 * 验证请求中的JWT令牌并提取用户信息
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  /**
   * 验证请求是否可以通过认证
   * @param context 执行上下文
   * @returns 是否允许请求通过
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否标记为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 公开路由无需认证
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Missing authentication token');
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      // 验证JWT令牌
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET_KEY,
      });

      // 将用户信息添加到请求对象
      request['user'] = {
        userid: payload.id || payload.sub || payload.userid,
        username: payload.username,
        role: payload.role,
        ...payload,
      };

      this.logger.debug(`User ${payload.username} authenticated successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  /**
   * 从请求头中提取JWT令牌
   * @param request HTTP请求对象
   * @returns 提取的令牌或undefined
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
