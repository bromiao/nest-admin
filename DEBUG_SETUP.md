# VS Code 调试配置说明

## 🚀 调试配置概览

已为项目配置了完整的VS Code调试环境，支持多种调试场景。

## 📋 可用的调试配置

### 1. 🚀 Debug NestJS (pnpm start:debug)
**主要调试配置** - 推荐使用

- **用途**: 启动NestJS应用并进入调试模式
- **命令**: `pnpm start:debug`
- **端口**: 9229
- **特性**: 
  - 自动重启
  - 热重载
  - 源码映射
  - 跳过node内部文件

### 2. 🔗 Attach to NestJS Process
**附加调试配置**

- **用途**: 附加到已运行的NestJS进程
- **使用场景**: 当应用已经在调试模式运行时
- **端口**: 9229

### 3. 🧪 Debug Jest Tests
**测试调试配置**

- **用途**: 调试所有Jest测试
- **命令**: `pnpm test --runInBand`
- **端口**: 9230

### 4. 🔧 Debug Current Test File
**单文件测试调试**

- **用途**: 调试当前打开的测试文件
- **使用方法**: 打开测试文件后启动此配置
- **端口**: 9231

## 🛠️ 使用方法

### 方法1: 使用调试面板
1. 打开VS Code调试面板 (`Ctrl+Shift+D` 或 `Cmd+Shift+D`)
2. 选择 "🚀 Debug NestJS (pnpm start:debug)"
3. 点击绿色播放按钮或按 `F5`

### 方法2: 使用命令面板
1. 打开命令面板 (`Ctrl+Shift+P` 或 `Cmd+Shift+P`)
2. 输入 "Debug: Start Debugging"
3. 选择调试配置

### 方法3: 快捷键
- 按 `F5` 启动调试（使用默认配置）
- 按 `Ctrl+F5` 或 `Cmd+F5` 启动但不调试

## 🎯 调试功能

### 断点设置
- **行断点**: 点击行号左侧设置
- **条件断点**: 右键行号选择"添加条件断点"
- **日志断点**: 右键行号选择"添加日志点"

### 调试控制
- `F5`: 继续执行
- `F10`: 单步跳过
- `F11`: 单步进入
- `Shift+F11`: 单步跳出
- `Ctrl+Shift+F5`: 重启调试

### 调试面板
- **变量**: 查看当前作用域的变量
- **监视**: 添加表达式监视
- **调用堆栈**: 查看函数调用链
- **断点**: 管理所有断点

## 🔧 配置详解

### 核心配置项
```json
{
  "runtimeExecutable": "pnpm",           // 使用pnpm作为运行时
  "runtimeArgs": ["start:debug"],        // 执行start:debug脚本
  "port": 9229,                          // 调试端口
  "restart": true,                       // 自动重启
  "sourceMaps": true,                    // 启用源码映射
  "console": "integratedTerminal"        // 使用集成终端
}
```

### 源码映射配置
```json
{
  "outFiles": ["${workspaceFolder}/dist/**/*.js"],
  "resolveSourceMapLocations": [
    "${workspaceFolder}/**",
    "!**/node_modules/**"
  ]
}
```

## 🚨 常见问题

### 1. 调试器无法连接
**解决方案:**
- 确保端口9229未被占用
- 检查防火墙设置
- 重启VS Code

### 2. 断点不生效
**解决方案:**
- 确保源码映射正确
- 检查TypeScript编译配置
- 清理dist目录重新编译

### 3. 热重载不工作
**解决方案:**
- 确保使用了`--watch`参数
- 检查文件监听权限
- 重启调试会话

## 📊 调试最佳实践

### 1. 设置合适的断点
```typescript
// ✅ 在关键逻辑处设置断点
async countBookList(params: any = {}, userid): Promise<number> {
  const whereConditions: any = {};
  
  // 设置断点检查条件构建
  if (title) {
    whereConditions.title = Like(`%${title}%`); // 断点
  }
  
  // 设置断点检查最终查询
  if (Object.keys(whereConditions).length > 0) {
    return await this.bookRepository.count({ where: whereConditions }); // 断点
  } else {
    return await this.bookRepository.count(); // 断点
  }
}
```

### 2. 使用条件断点
```typescript
// 只在特定条件下暂停
// 条件: params.title === 'test'
```

### 3. 使用日志断点
```typescript
// 不暂停执行，只输出日志
// 日志: whereConditions = {whereConditions}
```

## 🎯 调试技巧

### 1. 调试API请求
1. 在控制器方法设置断点
2. 使用Postman或curl发送请求
3. 检查请求参数和响应

### 2. 调试数据库查询
1. 在服务方法设置断点
2. 检查查询条件构建
3. 验证查询结果

### 3. 调试异步代码
1. 使用async/await断点
2. 检查Promise状态
3. 追踪异步调用链

## 📝 环境变量

调试时会自动设置以下环境变量：
```bash
NODE_ENV=development
```

可以在`.env.development`文件中添加更多调试相关的环境变量。

## 🔄 更新配置

如需修改调试配置，编辑 `.vscode/launch.json` 文件：

```json
{
  "name": "自定义调试配置",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["your-script"],
  // ... 其他配置
}
```

---

**配置版本**: v1.0  
**更新时间**: 2025-06-19  
**状态**: ✅ 已配置并测试
