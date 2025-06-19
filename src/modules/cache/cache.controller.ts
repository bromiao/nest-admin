import { Controller, Get, Delete, Post, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { LoggerService } from '../logger/logger.service';

/**
 * 缓存管理控制器
 * 提供缓存的查询、清除、统计等管理功能
 */
@ApiTags('cache')
@Controller('cache')
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('CacheController');
  }

  @Get('status')
  @ApiOperation({ summary: '获取Redis状态' })
  @ApiResponse({ status: 200, description: '成功获取Redis状态' })
  getRedisStatus() {
    const isEnabled = this.cacheService.isEnabled();
    const connectionStatus = this.cacheService.getConnectionStatus();

    this.logger.debug('获取Redis状态信息');
    return {
      code: 0,
      data: {
        enabled: isEnabled,
        status: connectionStatus,
      },
      message: isEnabled
        ? `Redis已启用，状态: ${connectionStatus}`
        : 'Redis已禁用',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取缓存统计信息' })
  @ApiResponse({ status: 200, description: '成功获取缓存统计' })
  async getStats() {
    const stats = await this.cacheService.getStats();
    this.logger.debug('获取缓存统计信息');
    return {
      code: 0,
      data: stats,
      message: '缓存统计信息获取成功',
    };
  }

  @Get('check/:key')
  @ApiOperation({ summary: '检查缓存键是否存在' })
  @ApiParam({ name: 'key', description: '缓存键' })
  @ApiResponse({ status: 200, description: '成功检查缓存键' })
  async checkCache(@Param('key') key: string) {
    const exists = await this.cacheService.exists(key);
    const ttl = await this.cacheService.getTtl(key);
    this.logger.debug(`检查缓存键: ${key}, 存在: ${exists}, TTL: ${ttl}`);
    return {
      code: 0,
      data: {
        key,
        exists,
        ttl,
      },
      message: exists ? '缓存键存在' : '缓存键不存在',
    };
  }

  @Get('ttl/:key')
  @ApiOperation({ summary: '获取缓存键的剩余过期时间' })
  @ApiParam({ name: 'key', description: '缓存键' })
  @ApiResponse({ status: 200, description: '成功获取TTL' })
  async getTtl(@Param('key') key: string) {
    const ttl = await this.cacheService.getTtl(key);
    this.logger.debug(`获取缓存TTL: ${key}, TTL: ${ttl}`);
    return {
      code: 0,
      data: {
        key,
        ttl,
      },
      message:
        ttl === -2 ? '键不存在' : ttl === -1 ? '永不过期' : `${ttl}秒后过期`,
    };
  }

  @Post('expire/:key')
  @ApiOperation({ summary: '设置缓存键的过期时间' })
  @ApiParam({ name: 'key', description: '缓存键' })
  @ApiQuery({ name: 'ttl', description: '过期时间（秒）', type: Number })
  @ApiResponse({ status: 200, description: '成功设置过期时间' })
  async setExpire(@Param('key') key: string, @Query('ttl') ttl: number) {
    await this.cacheService.expire(key, ttl);
    this.logger.debug(`设置缓存过期时间: ${key}, TTL: ${ttl}s`);
    return {
      code: 0,
      data: {
        key,
        ttl,
      },
      message: `已设置缓存键 ${key} 的过期时间为 ${ttl} 秒`,
    };
  }

  @Delete('clear/:key')
  @ApiOperation({ summary: '清除指定缓存键' })
  @ApiParam({ name: 'key', description: '缓存键' })
  @ApiResponse({ status: 200, description: '成功清除缓存键' })
  async clearCache(@Param('key') key: string) {
    await this.cacheService.delete(key);
    this.logger.debug(`已清除缓存键: ${key}`);
    return {
      code: 0,
      data: { key },
      message: `已清除缓存键: ${key}`,
    };
  }

  @Delete('clear-pattern/:pattern')
  @ApiOperation({ summary: '根据模式清除缓存键' })
  @ApiParam({ name: 'pattern', description: '匹配模式，如 user:*' })
  @ApiResponse({ status: 200, description: '成功清除匹配的缓存键' })
  async clearCacheByPattern(@Param('pattern') pattern: string) {
    if (!this.cacheService.isEnabled()) {
      return {
        code: -1,
        data: { pattern },
        message: 'Redis已禁用，无法执行模式删除',
      };
    }

    await this.cacheService.deleteByPattern(pattern);
    this.logger.debug(`已清除匹配模式的缓存: ${pattern}`);
    return {
      code: 0,
      data: { pattern },
      message: `已清除匹配模式 ${pattern} 的缓存键`,
    };
  }

  @Delete('clear-all')
  @ApiOperation({ summary: '清除所有缓存' })
  @ApiResponse({ status: 200, description: '成功清除所有缓存' })
  async clearAllCache() {
    if (!this.cacheService.isEnabled()) {
      return {
        code: -1,
        data: null,
        message: 'Redis已禁用，无法清除缓存',
        timestamp: new Date().toISOString(),
      };
    }

    await this.cacheService.clear();
    this.logger.debug('已清除所有缓存');
    return {
      code: 0,
      data: null,
      message: '已清除所有缓存',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新缓存' })
  @ApiResponse({ status: 200, description: '成功刷新缓存' })
  async refreshCache() {
    if (!this.cacheService.isEnabled()) {
      return {
        code: -1,
        data: null,
        message: 'Redis已禁用，无法刷新缓存',
        timestamp: new Date().toISOString(),
      };
    }

    await this.cacheService.clear();
    this.logger.debug('已刷新所有缓存');
    return {
      code: 0,
      data: null,
      message: '已刷新所有缓存',
      timestamp: new Date().toISOString(),
    };
  }
}
