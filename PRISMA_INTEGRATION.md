# Prisma集成文档

## 概述

本项目已成功集成Prisma ORM，支持TypeORM和Prisma双ORM切换。通过配置文件可以灵活选择使用哪种ORM框架。

## 🚀 新增功能

### 1. ORM切换配置

在环境变量中添加了`ORM_TYPE`配置项：

```bash
# .env 或 .env.development
ORM_TYPE=typeorm  # 可选值: typeorm | prisma
```

### 2. 新增模块

- **PrismaModule**: 全局Prisma模块，提供Prisma客户端服务
- **OrmModule**: ORM工厂模块，提供ORM类型判断服务
- **适配器服务**: 为每个业务模块提供ORM适配器

### 3. 适配器模式

每个业务模块都有对应的适配器服务：

- `UserAdapterService`: 用户服务适配器
- `BookAdapterService`: 书籍服务适配器

## 📁 新增文件结构

```
src/
├── modules/
│   ├── prisma/
│   │   ├── prisma.service.ts      # Prisma客户端服务
│   │   └── prisma.module.ts       # Prisma模块
│   ├── orm/
│   │   ├── orm-factory.service.ts # ORM工厂服务
│   │   └── orm.module.ts          # ORM模块
│   ├── user/
│   │   ├── user-prisma.service.ts # 用户Prisma服务
│   │   └── user-adapter.service.ts # 用户适配器服务
│   └── book/
│       ├── book-prisma.service.ts # 书籍Prisma服务
│       └── book-adapter.service.ts # 书籍适配器服务
├── enum/
│   └── orm.enum.ts                # ORM类型枚举
└── prisma/
    ├── schema.prisma              # Prisma数据模型
    └── seed.ts                    # 数据种子文件
```

## 🛠️ 使用方法

### 1. 切换ORM

修改环境变量文件：

```bash
# 使用TypeORM
ORM_TYPE=typeorm

# 使用Prisma
ORM_TYPE=prisma
```

### 2. Prisma命令

```bash
# 生成Prisma客户端
pnpm prisma:generate

# 推送数据库结构
pnpm prisma:push

# 拉取数据库结构
pnpm prisma:pull

# 创建迁移
pnpm prisma:migrate

# 部署迁移
pnpm prisma:migrate:deploy

# 重置数据库
pnpm prisma:migrate:reset

# 打开Prisma Studio
pnpm prisma:studio

# 运行种子数据
pnpm prisma:seed
```

### 3. API接口

新增了ORM信息查询接口：

```bash
# 获取用户模块ORM信息
GET /api/user/orm-info

# 获取书籍模块ORM信息
GET /api/book/orm-info
```

## 🔧 技术实现

### 1. 适配器模式

使用适配器模式统一不同ORM的接口：

```typescript
@Injectable()
export class UserAdapterService {
  constructor(
    private ormFactory: OrmFactoryService,
    private userService: UserService,
    private userPrismaService: UserPrismaService,
  ) {}

  async findAll(): Promise<(User | AdminUser)[]> {
    if (this.ormFactory.isPrisma()) {
      return await this.userPrismaService.findAll();
    }
    return await this.userService.findAll({});
  }
}
```

### 2. 工厂模式

使用工厂模式判断当前使用的ORM类型：

```typescript
@Injectable()
export class OrmFactoryService {
  private readonly ormType: OrmType;

  constructor(private configService: ConfigService) {
    this.ormType = this.configService.get<OrmType>(ConfigEnum.ORM_TYPE) || OrmType.TYPEORM;
  }

  isPrisma(): boolean {
    return this.ormType === OrmType.PRISMA;
  }

  isTypeOrm(): boolean {
    return this.ormType === OrmType.TYPEORM;
  }
}
```

### 3. 数据模型映射

Prisma Schema与TypeORM Entity的对应关系：

| TypeORM Entity | Prisma Model | 表名 |
|----------------|--------------|------|
| User | AdminUser | admin_user |
| Book | Book | book |
| Menu | Menu | menu |
| Role | Role | role |
| Contents | Contents | contents |

## 🔄 兼容性

### 1. API兼容性

- 所有现有API接口保持不变
- 响应数据格式完全一致
- 业务逻辑无任何变化

### 2. 功能兼容性

- TypeORM的所有功能继续可用
- 缓存系统正常工作
- 日志系统正常工作
- 认证授权正常工作

### 3. 数据兼容性

- 数据库表结构完全一致
- 数据类型映射正确
- 外键关系保持一致

## 🚨 注意事项

### 1. 数据类型差异

- TypeORM使用`number`类型的时间戳
- Prisma使用`BigInt`类型的时间戳
- 适配器会自动处理类型转换

### 2. 查询差异

- TypeORM支持原生SQL查询
- Prisma使用类型安全的查询API
- 复杂查询可能需要不同的实现方式

### 3. 迁移策略

- 建议在开发环境先测试Prisma
- 生产环境切换需要充分测试
- 可以逐步迁移不同的模块

## 📊 性能对比

| 特性 | TypeORM | Prisma |
|------|---------|--------|
| 类型安全 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 查询性能 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 学习曲线 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 生态系统 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 迁移工具 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 未来规划

1. **完善Prisma服务**: 为所有业务模块添加Prisma服务实现
2. **性能优化**: 针对Prisma进行查询优化
3. **监控集成**: 添加Prisma查询监控
4. **测试覆盖**: 增加Prisma相关的单元测试和集成测试
5. **文档完善**: 补充更多使用示例和最佳实践

## 🤝 贡献指南

如需添加新的业务模块或扩展现有功能：

1. 创建对应的Prisma服务
2. 创建适配器服务
3. 更新模块导入
4. 添加相应的测试
5. 更新文档

---

通过这种设计，项目可以灵活地在TypeORM和Prisma之间切换，为不同的使用场景提供最佳的解决方案。
