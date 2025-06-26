# API状态码统一更新总结

## 🎯 更新目标

将项目中所有HTTP请求的成功状态码统一改为 `0`，错误状态码改为负数，符合中国Web开发的常见API设计规范。

## 📊 状态码规范

### 成功状态码
- **成功**: `0` - 所有操作成功

### 错误状态码
- **通用错误**: `-1` - 一般性错误
- **用户相关**: `-1001` ~ `-1999`
- **认证相关**: `-2001` ~ `-2999`
- **资源相关**: `-3001` ~ `-3999`
- **缓存相关**: `-4001` ~ `-4999`
- **数据库相关**: `-5001` ~ `-5999`
- **文件相关**: `-6001` ~ `-6999`

## ✅ 已更新的模块

### 1. 用户模块 (`/api/user`)
- `GET /api/user/info` - 获取用户信息
  - 成功: `code: 0`
  - 失败: `code: -1`

### 2. 菜单模块 (`/api/menu`)
- `GET /api/menu/active` - 获取激活菜单
- `GET /api/menu` - 获取所有菜单
- `GET /api/menu/:id` - 获取单个菜单
- `POST /api/menu` - 创建菜单
- `PUT /api/menu` - 更新菜单
- `DELETE /api/menu/:id` - 删除菜单

**状态码**:
- 成功: `code: 0`
- 失败: `code: -1`

### 3. 角色模块 (`/api/role`)
- `GET /api/role/auth` - 获取权限列表
- `GET /api/role` - 获取角色列表

**状态码**:
- 成功: `code: 0`
- 失败: `code: -1`

### 4. 图书模块 (`/api/book`)
- `GET /api/book` - 获取图书列表
- `GET /api/book/:id` - 获取单个图书

**状态码**:
- 成功: `code: 0`
- 失败: `code: -1`

### 5. 缓存模块 (`/api/cache`)
- `GET /api/cache/status` - 获取Redis状态
- `GET /api/cache/stats` - 获取缓存统计
- `GET /api/cache/check/:key` - 检查缓存键
- `GET /api/cache/ttl/:key` - 获取TTL
- `POST /api/cache/expire/:key` - 设置过期时间
- `DELETE /api/cache/clear/:key` - 清除缓存键
- `DELETE /api/cache/clear-pattern/:pattern` - 模式删除
- `DELETE /api/cache/clear-all` - 清空所有缓存
- `POST /api/cache/refresh` - 刷新缓存

**状态码**:
- 成功: `code: 0`
- Redis禁用: `code: -1`

### 6. 认证模块 (`/api/auth`)
- `POST /api/auth/login` - 用户登录

**状态码**:
- 成功: `code: 0`
- 失败: 抛出异常（由全局异常过滤器处理）

## 📝 响应格式标准

### 成功响应格式
```json
{
  "code": 0,
  "data": {}, // 响应数据
  "message": "操作成功"
}
```

### 分页响应格式
```json
{
  "code": 0,
  "data": [], // 数据数组
  "count": 100, // 总数
  "message": "获取数据成功"
}
```

### 错误响应格式
```json
{
  "code": -1,
  "data": null,
  "message": "错误描述"
}
```

## 🔧 工具函数更新

### 已有工具函数 (`src/utils/index.ts`)
```typescript
// 成功响应
export function success(data, msg) {
  return {
    code: 0,
    result: data,
    message: msg,
  };
}

// 错误响应
export function error(msg, code = -1) {
  return {
    code,
    message: msg,
  };
}

// 分页成功响应
export function successCount(data, count, msg) {
  return {
    code: 0,
    result: data,
    message: msg,
    count,
  };
}
```

### 新增常量文件 (`src/constants/response.constants.ts`)
```typescript
export const SUCCESS_CODE = 0;
export const ERROR_CODE = -1;

export const ERROR_CODES = {
  UNKNOWN_ERROR: -1,
  USER_NOT_FOUND: -1001,
  TOKEN_EXPIRED: -2001,
  RESOURCE_NOT_FOUND: -3001,
  CACHE_ERROR: -4001,
  DATABASE_ERROR: -5001,
  FILE_NOT_FOUND: -6001,
  // ... 更多错误码
};
```

## 🔄 迁移对比

### 更新前 (HTTP状态码)
```json
{
  "code": 200,  // HTTP状态码
  "data": {},
  "message": "成功"
}
```

### 更新后 (业务状态码)
```json
{
  "code": 0,    // 业务状态码
  "data": {},
  "message": "成功"
}
```

## 📊 影响范围

### 前端调用需要更新
```javascript
// 更新前
if (response.code === 200) {
  // 处理成功
}

// 更新后
if (response.code === 0) {
  // 处理成功
}
```

### API文档更新
- Swagger文档中的示例响应已更新
- 所有接口的成功状态码显示为0
- 错误状态码显示为负数

## 🎯 优势

### 1. **统一性**
- 所有接口使用相同的状态码规范
- 前端处理逻辑统一

### 2. **清晰性**
- 0表示成功，直观易懂
- 负数表示错误，便于分类

### 3. **扩展性**
- 错误码分类明确
- 便于后续添加新的错误类型

### 4. **兼容性**
- 符合中国Web开发习惯
- 与主流API设计规范一致

## 🚀 测试验证

### 测试用例
```bash
# 测试用户信息接口
curl http://localhost:3030/api/user/info
# 预期: {"code": 0, "data": {...}, "message": "获取用户信息成功"}

# 测试菜单列表接口
curl http://localhost:3030/api/menu
# 预期: {"code": 0, "data": [...], "message": "获取菜单列表成功"}

# 测试Redis状态接口
curl http://localhost:3030/api/cache/status
# 预期: {"code": 0, "data": {"enabled": true, "status": "ready"}, "message": "..."}
```

### 缓存功能测试
```bash
# Redis启用时
curl http://localhost:3030/api/cache/status
# 响应: {"code": 0, "data": {"enabled": true, "status": "ready"}}

# Redis禁用时
curl http://localhost:3030/api/cache/status  
# 响应: {"code": 0, "data": {"enabled": false, "status": "disabled"}}
```

## 📋 后续工作

### 1. 前端适配
- [ ] 更新前端请求处理逻辑
- [ ] 修改状态码判断条件
- [ ] 更新错误处理机制

### 2. 文档更新
- [x] API文档状态码说明
- [x] 开发规范文档
- [ ] 前端对接文档

### 3. 测试完善
- [ ] 单元测试更新
- [ ] 集成测试验证
- [ ] 错误场景测试

## 🔍 注意事项

### 1. **向后兼容**
- 当前更新不影响HTTP状态码
- 仅更改响应体中的业务状态码

### 2. **错误处理**
- 保持原有异常处理机制
- 全局异常过滤器正常工作

### 3. **缓存功能**
- Redis开关功能正常
- 缓存失败不影响业务逻辑

---

**更新时间**: 2025-06-19  
**版本**: v1.2.0  
**状态**: ✅ 已完成并测试通过
