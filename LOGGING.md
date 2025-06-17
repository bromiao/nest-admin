# 日志系统使用指南

## 简介

本项目集成了基于 Winston 的高级日志系统，提供了丰富的日志记录功能，包括：

- 多级别日志记录（error、warn、info、debug、verbose）
- 日志文件按日期轮换
- 控制台彩色日志输出
- HTTP 请求日志记录
- 方法执行时间记录
- 自定义日志上下文
- 日志装饰器

## 日志级别

日志系统支持以下级别（按严重程度从高到低排序）：

1. **ERROR**：错误日志，表示应用程序出现了错误
2. **WARN**：警告日志，表示可能存在的问题
3. **INFO**：信息日志，表示应用程序的正常运行状态
4. **DEBUG**：调试日志，用于开发和调试
5. **VERBOSE**：详细日志，包含更多细节

## 日志文件

日志文件按日期轮换，存储在项目根目录的 `logs` 文件夹中：

- `application-%DATE%.log`：包含所有 INFO 级别及以上的日志
- `error-%DATE%.log`：仅包含 ERROR 级别的日志
- `warn-%DATE%.log`：仅包含 WARN 级别的日志
- `debug-%DATE%.log`：仅包含 DEBUG 级别的日志（仅在开发环境）

## 基本用法

### 在服务中使用

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class YourService {
  constructor(private readonly logger: LoggerService) {
    // 设置日志上下文
    this.logger.setContext('YourService');
  }

  someMethod() {
    // 记录不同级别的日志
    this.logger.log('这是一条信息日志');
    this.logger.error('这是一条错误日志', '错误堆栈信息');
    this.logger.warn('这是一条警告日志');
    this.logger.debug('这是一条调试日志');
    this.logger.verbose('这是一条详细日志');
    
    // 使用自定义上下文
    this.logger.log('自定义上下文日志', 'CustomContext');
  }
}
```

### 使用日志装饰器

```typescript
import { Controller, Get } from '@nestjs/common';
import { LogContext, LogLevel, SkipLog } from '../logger/logger.decorator';

@Controller('example')
@LogContext('ExampleController') // 设置控制器级别的日志上下文
export class ExampleController {
  
  @Get()
  @LogLevel('debug') // 设置方法级别的日志级别
  getExample() {
    return { message: '这个请求会被记录为 debug 级别' };
  }
  
  @Get('skip')
  @SkipLog() // 跳过日志记录
  skipLogging() {
    return { message: '这个请求不会被记录' };
  }
}
```

## 高级用法

### 记录带有元数据的日志

```typescript
this.logger.log('用户登录', {
  userId: 123,
  username: 'admin',
  ip: '192.168.1.1',
  timestamp: new Date(),
});
```

### 自定义日志格式

可以在 `logger.config.ts` 文件中自定义日志格式：

```typescript
// 文件日志格式
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  winston.format.json(),
);
```

### 配置日志级别

可以在环境配置文件中设置日志级别：

```
# .env.development
LOG_LEVEL=debug

# .env.production
LOG_LEVEL=info
```

## 最佳实践

1. **设置合适的上下文**：始终为日志设置上下文，便于定位问题
2. **选择合适的日志级别**：
   - ERROR：用于记录应用程序错误
   - WARN：用于记录可能导致问题的情况
   - INFO：用于记录重要的业务事件
   - DEBUG：用于记录调试信息
   - VERBOSE：用于记录详细的流程信息
3. **包含足够的信息**：日志应包含足够的信息，以便于问题排查
4. **避免敏感信息**：不要记录密码、令牌等敏感信息
5. **使用结构化日志**：尽量使用结构化的日志格式，便于后续分析

## 日志分析

可以使用以下工具分析日志：

- **grep**：在日志文件中搜索特定内容
- **awk**：处理和分析日志数据
- **ELK Stack**：使用 Elasticsearch、Logstash 和 Kibana 进行高级日志分析
- **Grafana**：创建日志可视化仪表板

## 注意事项

1. 生产环境中应设置合适的日志级别，避免记录过多的调试信息
2. 定期清理或归档旧的日志文件，避免占用过多磁盘空间
3. 确保日志目录具有适当的写入权限
