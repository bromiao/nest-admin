# Redis 缓存集成指南

本项目已成功集成Redis作为缓存存储，提供高性能的数据缓存解决方案。

## 功能特性

### 1. Redis 配置
- 支持多环境配置（开发、测试、生产）
- 连接池管理和重连策略
- 键前缀和TTL配置
- 密码认证和数据库选择

### 2. 缓存服务 (CacheService)
- **基础操作**: get, set, delete, exists
- **高级功能**: getOrSet, ttl, expire, deleteByPattern
- **批量操作**: 支持模式匹配的批量删除
- **统计信息**: Redis连接状态和性能统计

### 3. 缓存装饰器
- **@Cacheable**: 自动缓存方法返回值
- **@CacheEvict**: 自动清除相关缓存
- **@CachePut**: 更新缓存数据
- **模板变量**: 支持动态键生成 `user:${id}`

### 4. 缓存拦截器
- 自动处理HTTP请求缓存
- 支持条件缓存和键模板解析
- GET请求自动缓存优化

## 配置说明

### 环境变量配置
```bash
# Redis基础配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# 缓存配置
REDIS_TTL=3600                    # 默认过期时间（秒）
REDIS_KEY_PREFIX=nest-admin:      # 键前缀
REDIS_RECONNECT=true              # 启用重连
```

### 开发环境配置 (.env.development)
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=example
REDIS_DB=1
REDIS_TTL=3600
REDIS_KEY_PREFIX=nest-admin-dev:
REDIS_RECONNECT=true
```

## 使用示例

### 1. 基础缓存操作
```typescript
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ExampleService {
  constructor(private readonly cacheService: CacheService) {}

  // 设置缓存
  async setData(key: string, data: any) {
    await this.cacheService.set(key, data, 300); // 缓存5分钟
  }

  // 获取缓存
  async getData(key: string) {
    return await this.cacheService.get(key);
  }

  // 获取或设置缓存
  async getOrSetData(key: string) {
    return await this.cacheService.getOrSet(
      key,
      async () => {
        // 数据获取逻辑
        return await this.fetchDataFromDatabase();
      },
      300
    );
  }
}
```

### 2. 使用缓存装饰器
```typescript
import { Cacheable, CacheEvict, CachePut } from '../cache/cache.decorator';

@Injectable()
export class UserService {
  // 缓存用户信息
  @Cacheable({ key: 'user:${0}', ttl: 300 })
  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne(id);
  }

  // 条件缓存
  @Cacheable({ 
    key: 'users:list:${0}', 
    ttl: 180,
    condition: (query) => !query.realtime 
  })
  async findUsers(query: any): Promise<User[]> {
    return await this.userRepository.find(query);
  }

  // 更新时清除相关缓存
  @CacheEvict(['user:${id}', 'users:list:*'])
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return await this.userRepository.update(id, data);
  }

  // 更新缓存
  @CachePut({ key: 'user:${0}', ttl: 300 })
  async refreshUser(id: number): Promise<User> {
    return await this.userRepository.findOne(id);
  }
}
```

### 3. 控制器中使用缓存
```typescript
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  // 自动缓存GET请求
  @Get(':id')
  @Cacheable({ key: 'api:user:${id}', ttl: 300 })
  async getUser(@Param('id') id: number) {
    return await this.userService.findUserById(id);
  }

  // 手动缓存管理
  @Delete('cache/:id')
  async clearUserCache(@Param('id') id: number) {
    await this.cacheService.delete(`user:${id}`);
    return { message: '缓存已清除' };
  }
}
```

## 缓存策略

### 1. 用户数据缓存
- **用户信息**: `user:${id}` (5分钟)
- **用户列表**: `users:list:${query}` (3分钟)
- **用户统计**: `users:stats` (30分钟)
- **用户名查询**: `users:username:${username}` (10分钟)

### 2. 缓存键命名规范
```
nest-admin:user:123                    # 用户详情
nest-admin:users:list:page1_size20     # 用户列表
nest-admin:users:stats                 # 用户统计
nest-admin:api:user:123               # API响应缓存
```

### 3. TTL 设置建议
- **用户基础信息**: 300秒 (5分钟)
- **列表数据**: 180秒 (3分钟)
- **统计数据**: 1800秒 (30分钟)
- **API响应**: 60-300秒

## API 接口

### 缓存管理接口
```
GET    /api/cache/stats              # 获取Redis统计信息
GET    /api/cache/check/:key         # 检查缓存键是否存在
GET    /api/cache/ttl/:key           # 获取缓存TTL
POST   /api/cache/expire/:key?ttl=60 # 设置缓存过期时间
DELETE /api/cache/clear/:key         # 清除指定缓存
DELETE /api/cache/clear-pattern/:pattern # 批量清除缓存
DELETE /api/cache/clear-all          # 清除所有缓存
POST   /api/cache/refresh            # 刷新缓存
```

### 用户缓存接口
```
GET    /api/user/stats               # 获取用户统计（缓存）
GET    /api/user/batch?ids=1,2,3     # 批量获取用户（缓存优化）
GET    /api/user/cache/clear/:id     # 清除用户缓存
POST   /api/user/cache/warm-up       # 预热用户缓存
```

## 性能优化

### 1. 缓存命中率优化
- 合理设置TTL避免频繁过期
- 使用条件缓存避免无效缓存
- 预热常用数据提高命中率

### 2. 内存使用优化
- 设置合适的键前缀避免冲突
- 及时清理过期和无用缓存
- 监控Redis内存使用情况

### 3. 网络优化
- 使用连接池减少连接开销
- 批量操作减少网络往返
- 启用压缩减少传输数据量

## 监控和调试

### 1. 日志记录
- 缓存命中/未命中日志
- 缓存操作错误日志
- 性能统计日志

### 2. 健康检查
```typescript
// 检查Redis连接状态
const stats = await this.cacheService.getStats();
console.log('Redis状态:', stats.connected);
```

### 3. 性能监控
- 监控缓存命中率
- 监控响应时间改善
- 监控内存使用情况

## 故障处理

### 1. Redis连接失败
- 自动重连机制
- 降级到无缓存模式
- 错误日志记录

### 2. 缓存数据不一致
- 设置合理的TTL
- 及时清除相关缓存
- 使用版本控制

### 3. 内存不足
- 监控内存使用
- 清理过期数据
- 调整TTL策略

## 最佳实践

1. **键命名**: 使用有意义的前缀和层次结构
2. **TTL设置**: 根据数据更新频率设置合适的过期时间
3. **错误处理**: 缓存失败时应该降级到数据库查询
4. **监控**: 定期检查缓存命中率和性能指标
5. **清理**: 及时清理相关缓存避免数据不一致
6. **测试**: 编写缓存相关的单元测试和集成测试

## 部署注意事项

1. **生产环境**: 使用Redis集群提高可用性
2. **安全**: 设置Redis密码和网络访问控制
3. **备份**: 定期备份Redis数据
4. **监控**: 部署Redis监控和告警系统
5. **容量规划**: 根据业务需求规划Redis内存容量
