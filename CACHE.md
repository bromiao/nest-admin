# 缓存系统使用指南

## 简介

本项目集成了高效的缓存系统，用于提高频繁访问数据的响应速度，减轻数据库负担。缓存系统基于 NestJS 的 Cache Manager 模块实现，支持多种缓存策略和操作方式。

## 主要功能

- **数据缓存**：自动缓存频繁访问的数据
- **缓存过期**：支持设置缓存过期时间
- **缓存清理**：提供手动清理缓存的接口
- **缓存装饰器**：简化缓存操作的方法装饰器

## 已缓存的数据

目前，以下数据已经实现了缓存：

1. **用户数据**：
   - 根据ID查询用户 (30分钟)
   - 根据用户名查询用户 (30分钟)
   - 用户列表查询 (30分钟)

2. **菜单数据**：
   - 所有菜单 (1小时)
   - 激活的菜单 (1小时)

## 使用方法

### 1. 在服务中使用缓存

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class YourService {
  constructor(private readonly cacheService: CacheService) {}

  async getData(id: number) {
    // 生成缓存键
    const cacheKey = `data:${id}`;
    
    // 使用getOrSet方法，如果缓存存在则返回缓存，否则执行回调函数并缓存结果
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // 从数据库或其他来源获取数据
        return this.fetchDataFromDatabase(id);
      },
      3600000 // 缓存1小时 (可选)
    );
  }
}
```

### 2. 使用缓存装饰器

```typescript
import { Injectable } from '@nestjs/common';
import { Cacheable } from '../cache/cache.decorator';

@Injectable()
export class YourService {
  // 使用Cacheable装饰器自动缓存方法结果
  // 第一个参数是缓存键前缀，第二个参数是缓存时间（毫秒）
  @Cacheable('yourService:findOne', 30 * 60 * 1000)
  async findOne(id: number) {
    // 从数据库获取数据
    return this.repository.findOneBy({ id });
  }
}
```

### 3. 手动管理缓存

可以通过缓存控制器提供的API手动管理缓存：

- `GET /api/cache/stats` - 获取缓存统计信息
- `DELETE /api/cache/clear/:key` - 清除指定键的缓存
- `DELETE /api/cache/clear-all` - 清除所有缓存
- `POST /api/cache/refresh` - 刷新缓存

## 缓存失效策略

1. **自动过期**：缓存项会在设定的TTL（生存时间）后自动过期
2. **手动清除**：当数据更新时，相关缓存会被手动清除
3. **全局清除**：可以通过API清除所有缓存

## 最佳实践

1. **合理设置TTL**：根据数据更新频率设置合适的缓存过期时间
2. **使用有意义的缓存键**：缓存键应该包含足够的信息，以便于识别和管理
3. **及时清除过期缓存**：当数据更新时，应该清除相关的缓存
4. **监控缓存命中率**：定期检查缓存的效果，调整缓存策略

## 注意事项

1. 缓存系统默认使用内存存储，重启应用后缓存会丢失
2. 在分布式环境中，应考虑使用Redis等分布式缓存解决方案
3. 不要缓存敏感数据或频繁变化的数据
4. 缓存过多可能导致内存占用过高，应合理控制缓存数量和大小
