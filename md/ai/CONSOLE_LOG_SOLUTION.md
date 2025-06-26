# 🔧 Console.log 输出问题解决方案

## 🚨 问题描述

在 NestJS 应用中，`console.log` 没有输出到控制台，这是因为应用使用了 Winston 日志系统覆盖了默认的控制台输出。

## 🔍 问题原因

1. **Winston 日志系统覆盖**：应用在 `main.ts` 中使用了自定义的 Winston 日志服务
2. **日志缓冲**：`bufferLogs: true` 导致日志延迟显示
3. **日志级别限制**：某些日志级别可能被过滤

## ✅ 解决方案

### 方案 1：临时禁用 Winston 日志系统（推荐用于调试）

在 `src/main.ts` 中修改：

```typescript
// 修改前
const app = await NestFactory.create(AppModule, {
  cors: true,
  httpsOptions,
  bufferLogs: true, // 缓冲日志
  logger: ['error', 'warn', 'log', 'debug'], // 临时使用内置日志器
});

// 使用Winston日志服务
const logger = await app.resolve(LoggerService);
logger.setContext('Bootstrap');
app.useLogger(logger);

// 修改后
const app = await NestFactory.create(AppModule, {
  cors: true,
  httpsOptions,
  bufferLogs: false, // 禁用日志缓冲，立即输出
  logger: ['error', 'warn', 'log', 'debug', 'verbose'], // 使用内置日志器，包含所有级别
});

// 临时注释掉Winston日志服务，使用默认的console输出
// const logger = await app.resolve(LoggerService);
// logger.setContext('Bootstrap');
// app.useLogger(logger);
```

### 方案 2：使用调试工具函数

创建 `src/utils/debug.ts`：

```typescript
// 保存原始的console方法
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

export const debugLog = {
  log: (...args: any[]) => {
    originalConsole.log('🔥 [DEBUG]', ...args);
    // 同时写入到 process.stdout 确保输出
    process.stdout.write(`🔥 [DEBUG] ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}\n`);
  },
  // ... 其他方法
};

// 全局使用
(global as any).debugLog = debugLog;
```

使用方式：
```typescript
// 在任何地方使用
debugLog.log('这是一个调试信息', { data: 'test' });
```

### 方案 3：调整日志级别

在 `.env.development` 中：

```bash
# 修改日志级别为debug以显示更多日志
LOG_LEVEL=debug
```

### 方案 4：创建测试控制器

创建 `src/test-console.controller.ts`：

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('test-console')
export class TestConsoleController {
  @Get()
  testConsoleLog() {
    console.log('🔥 这是一个测试 console.log 输出');
    console.warn('⚠️ 这是一个测试 console.warn 输出');
    console.error('❌ 这是一个测试 console.error 输出');
    
    return {
      message: '控制台日志测试完成，请查看终端输出',
      timestamp: new Date().toISOString(),
    };
  }
}
```

## 🎯 验证结果

修改后，可以看到以下输出：

```bash
当前环境: development
环境配置: {
  DB_TYPE: 'mysql',
  DB_HOST: '127.0.0.1',
  ...
}
```

这说明 `console.log` 现在可以正常输出了。

## 📋 使用建议

### 开发环境
- 使用方案 1 临时禁用 Winston，方便调试
- 使用方案 2 的 `debugLog` 工具进行特定调试

### 生产环境
- 保持 Winston 日志系统，确保日志的结构化和持久化
- 使用 Winston 的日志方法而不是 `console.log`

### 调试技巧

1. **临时调试**：
```typescript
// 临时调试代码
console.log('🔥 调试信息:', data);
```

2. **使用 debugLog**：
```typescript
import { debugLog } from '../utils/debug';
debugLog.log('调试信息:', data);
```

3. **使用 Winston Logger**：
```typescript
import { LoggerService } from '../logger/logger.service';

constructor(private logger: LoggerService) {}

someMethod() {
  this.logger.log('正常日志信息');
  this.logger.debug('调试信息');
  this.logger.error('错误信息');
}
```

## 🚀 最佳实践

1. **开发时**：使用 `console.log` 进行快速调试
2. **代码提交前**：将 `console.log` 替换为适当的日志方法
3. **生产环境**：使用结构化日志记录
4. **调试工具**：保留 `debugLog` 工具用于特殊情况

## 🔄 恢复 Winston 日志系统

当调试完成后，记得恢复 Winston 日志系统：

```typescript
const app = await NestFactory.create(AppModule, {
  cors: true,
  httpsOptions,
  bufferLogs: true, // 恢复日志缓冲
  logger: ['error', 'warn', 'log', 'debug'],
});

// 恢复Winston日志服务
const logger = await app.resolve(LoggerService);
logger.setContext('Bootstrap');
app.useLogger(logger);
```

---

## 🎉 问题解决！

**现在 `console.log` 可以正常输出到控制台了！你可以在开发过程中自由使用 `console.log` 进行调试。**
