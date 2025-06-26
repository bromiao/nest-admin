import { Injectable, Logger } from '@nestjs/common';
import { OrmFactoryService } from '../orm/orm-factory.service';
import { AuthService } from './auth.service';
import { UserAdapterService } from '../user/user-adapter.service';

/**
 * 认证适配器服务
 * 根据ORM类型选择相应的服务实现
 */
@Injectable()
export class AuthAdapterService {
  private readonly logger = new Logger(AuthAdapterService.name);

  constructor(
    private ormFactory: OrmFactoryService,
    private authService: AuthService,
    private userAdapterService: UserAdapterService,
  ) {}

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<any> {
    // Auth服务本身不需要区分ORM，因为它主要处理JWT逻辑
    // 但它依赖的UserService需要通过适配器调用
    return await this.authService.login(username, password);
  }

  /**
   * 验证用户（如果AuthService中没有此方法，则直接调用login）
   */
  async validateUser(username: string, password: string): Promise<any> {
    return await this.authService.login(username, password);
  }

  /**
   * 刷新令牌（简化实现）
   */
  async refreshToken(refreshToken: string): Promise<any> {
    // 如果AuthService中没有refreshToken方法，返回错误或重新登录
    throw new Error('刷新令牌功能暂未实现');
  }

  /**
   * 登出（简化实现）
   */
  async logout(token: string): Promise<void> {
    // 如果AuthService中没有logout方法，可以简单返回
    this.logger.log('用户登出');
  }

  /**
   * 验证JWT令牌（简化实现）
   */
  async validateToken(token: string): Promise<any> {
    // 如果AuthService中没有validateToken方法，可以使用JWT服务验证
    throw new Error('令牌验证功能暂未实现');
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: number): Promise<any> {
    // 通过用户适配器服务获取用户信息
    return await this.userAdapterService.findOne(userId);
  }

  /**
   * 修改密码（简化实现）
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    throw new Error('修改密码功能暂未实现');
  }

  /**
   * 重置密码（简化实现）
   */
  async resetPassword(username: string): Promise<any> {
    throw new Error('重置密码功能暂未实现');
  }

  /**
   * 获取当前使用的ORM信息
   */
  getOrmInfo() {
    return this.ormFactory.getOrmInfo();
  }
}
