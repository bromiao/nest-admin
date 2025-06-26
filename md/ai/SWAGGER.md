# Swagger API 文档使用指南

## 简介

本项目集成了 Swagger UI，提供了一个交互式的 API 文档界面，可以帮助开发者快速了解和测试 API。

## 访问方式

启动项目后，可以通过以下 URL 访问 Swagger 文档：

```
https://localhost:3030/api/docs
```

> 注意：端口号可能会根据您的配置而变化。

## 功能特点

1. **API 浏览**：查看所有可用的 API 端点，包括请求方法、URL、参数和响应格式。
2. **API 测试**：直接在浏览器中测试 API 请求，无需使用其他工具。
3. **认证支持**：支持 JWT 认证，可以在 Swagger UI 中设置认证令牌。
4. **模型展示**：查看所有数据模型的结构和字段说明。

## 使用方法

### 浏览 API

1. 打开 Swagger UI 页面
2. API 按照标签分组展示，点击标签可以展开对应分组的 API
3. 点击具体的 API 可以查看详细信息

### 测试 API

1. 点击要测试的 API
2. 点击 "Try it out" 按钮
3. 填写请求参数
4. 点击 "Execute" 按钮发送请求
5. 查看响应结果

### 认证

对于需要认证的 API：

1. 点击页面右上角的 "Authorize" 按钮
2. 在弹出的对话框中，输入 JWT 令牌（不需要输入 "Bearer " 前缀）
3. 点击 "Authorize" 按钮
4. 现在您可以访问需要认证的 API 了

## API 分组

本项目的 API 按照以下标签分组：

- **auth**: 认证相关 API，如登录
- **user**: 用户管理 API
- **book**: 书籍管理 API
- **menu**: 菜单管理 API
- **contents**: 内容管理 API
- **role**: 角色管理 API

## 常见问题

### 1. 认证失败

如果遇到认证失败的问题，请检查：
- JWT 令牌是否正确
- 令牌是否已过期
- 是否正确设置了认证信息

### 2. 请求参数错误

如果遇到请求参数错误，请检查：
- 必填参数是否已填写
- 参数格式是否正确
- 参数值是否在有效范围内

### 3. CORS 问题

如果在浏览器中直接使用 Swagger UI 测试 API 时遇到 CORS 问题，请确保服务器已正确配置 CORS。

## 更多资源

- [Swagger 官方文档](https://swagger.io/docs/)
- [NestJS Swagger 文档](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI 规范](https://swagger.io/specification/)
