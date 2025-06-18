import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { LoggerService } from '../logger/logger.service';
import { LogContext } from '../logger/logger.decorator';

@ApiTags('cache')
@Controller('cache')
@LogContext('CacheController')
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: '获取缓存统计信息' })
  @ApiResponse({ status: 200, description: '成功获取缓存统计信息' })
  getStats() {
    this.logger.debug('获取缓存统计信息');
    return {
      message: '缓存统计信息',
      // 实际应用中，可以返回更多缓存统计信息
      status: 'active',
    };
  }

  @Delete('clear/:key')
  @ApiOperation({ summary: '清除指定键的缓存' })
  @ApiParam({ name: 'key', description: '缓存键' })
  @ApiResponse({ status: 200, description: '成功清除缓存' })
  async clearCache(@Param('key') key: string) {
    await this.cacheService.delete(key);
    this.logger.debug(`已清除缓存: ${key}`);
    return {
      message: `缓存 ${key} 已清除`,
    };
  }

  @Delete('clear-all')
  @ApiOperation({ summary: '清除所有缓存' })
  @ApiResponse({ status: 200, description: '成功清除所有缓存' })
  async clearAllCache() {
    await this.cacheService.reset();
    this.logger.debug('已清除所有缓存');
    return {
      message: '所有缓存已清除',
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新缓存' })
  @ApiResponse({ status: 200, description: '成功刷新缓存' })
  async refreshCache() {
    // 在实际应用中，可以实现更复杂的缓存刷新逻辑
    await this.cacheService.reset();
    this.logger.debug('已刷新所有缓存');
    return {
      message: '所有缓存已刷新',
    };
  }
}
