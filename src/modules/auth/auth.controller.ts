import { Body, Controller, Post, UseFilters, Inject } from '@nestjs/common';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { LogContext, LogLevel } from '../logger/logger.decorator';
import { LogLevel as LogLevelEnum } from '../logger/logger.constants';
import { LoggerService } from '../logger/logger.service';

@ApiTags('auth')
@Controller('auth')
@LogContext('AuthController') // 设置日志上下文
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('AuthController');
  }

  @Public()
  @Post('login')
  @LogLevel(LogLevelEnum.DEBUG) // 使用DEBUG级别记录详细信息
  @UseFilters(HttpExceptionFilter)
  @ApiOperation({ summary: '用户登录', description: '用户登录并获取JWT令牌' })
  @ApiBody({
    type: LoginDto,
    description: '登录信息',
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() params: LoginDto) {
    this.logger.debug(`Login attempt for user: ${params.username}`);

    try {
      const result = await this.authService.login(
        params.username,
        params.password,
      );

      // 详细记录登录成功的响应，包括完整的结果数据
      this.logger.debug('Login successful', undefined, {
        username: params.username,
        userId: result.user.id,
        role: result.user.role,
        result: JSON.stringify(result), // 记录完整的结果
      });

      const response = {
        code: 0,
        result,
        message: '登录成功',
      };

      // 记录完整的响应对象
      this.logger.debug('Full response object', undefined, { response });

      return response;
    } catch (error) {
      // 记录登录失败的错误
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
