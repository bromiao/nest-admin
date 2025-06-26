# 适配器服务实现指南

## 🎯 目标

为所有接口的调用服务添加 adapter.service，保证最终接口调用的是 xxAdapterService，实现 TypeORM 和 Prisma 的双 ORM 支持。

## 📋 当前状态

### ✅ 已完成的模块
- **BookModule**: 已有完整的适配器实现
- **UserModule**: 已有完整的适配器实现

### 🚧 需要修复的问题

#### 1. Prisma Schema 不匹配
当前 Prisma Schema 中的模型与 TypeORM 实体不匹配，导致类型错误。

**问题示例**:
```typescript
// TypeORM 实体 (Contents)
export class Contents {
  id: number;
  title: string;
  content: string;
  type: string;
  status: number;
  createUser: string;
  createTime: Date;
  updateTime: Date;
}

// Prisma Schema (Contents) - 不匹配
model Contents {
  fileName String  @db.VarChar(100)
  id       String  @db.VarChar(100)  // 类型不匹配：应该是 Int
  href     String? @db.VarChar(255)
  // ... 缺少 title, content, type, status 等字段
}
```

#### 2. 服务方法不完整
现有的 TypeORM 服务缺少适配器中使用的方法。

**缺少的方法示例**:
```typescript
// MenuService 缺少的方法
- findOne(id: number)
- findByParentId(parentId: number)
- findByStatus(status: number)
- remove(id: number)
- count()
- findWithPagination()
- search()
// ... 等等
```

#### 3. 控制器方法不匹配
控制器中调用的方法与适配器服务提供的方法不匹配。

## 🔧 修复方案

### 方案 1: 渐进式修复（推荐）

#### 步骤 1: 修复 Prisma Schema
```prisma
// 更新 Contents 模型以匹配 TypeORM 实体
model Contents {
  id         Int       @id @default(autoincrement())
  title      String
  content    String?   @db.Text
  type       String?
  status     Int       @default(1)
  createUser String?   @db.VarChar(50)
  createTime DateTime? @default(now())
  updateTime DateTime? @updatedAt

  @@map("contents")
}

// 更新 Menu 模型
model Menu {
  id          Int       @id @default(autoincrement())
  name        String
  path        String?
  component   String?
  icon        String?
  parentId    Int?
  sort        Int?      @default(0)
  status      Int?      @default(1)
  type        Int?      @default(1)
  permission  String?
  createTime  DateTime? @default(now())
  updateTime  DateTime? @updatedAt
  description String?

  @@map("menu")
}

// 更新 Role 模型
model Role {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?   // 替代 remark
  status      Int       @default(1)
  createTime  DateTime? @default(now())
  updateTime  DateTime? @updatedAt

  @@map("role")
}
```

#### 步骤 2: 为现有服务添加缺失方法
```typescript
// 示例：为 MenuService 添加缺失方法
export class MenuService {
  // 现有方法...

  async findOne(id: number): Promise<Menu> {
    return await this.menuRepository.findOne({ where: { id } });
  }

  async findByParentId(parentId: number | null): Promise<Menu[]> {
    return await this.menuRepository.find({ 
      where: { parentId },
      order: { id: 'ASC' }
    });
  }

  async remove(id: number): Promise<void> {
    await this.menuRepository.delete(id);
  }

  // ... 其他缺失方法
}
```

#### 步骤 3: 修复适配器服务的类型问题
```typescript
// 使用正确的类型定义
export class MenuAdapterService {
  async create(menuData: Partial<Menu>): Promise<Menu | PrismaMenu> {
    if (this.ormFactory.isPrisma()) {
      // 只传递 Prisma 模型支持的字段
      const prismaData = {
        name: menuData.name!,
        path: menuData.path,
        component: menuData.component,
        // ... 只包含 Prisma 模型中存在的字段
      };
      return await this.menuPrismaService.create(prismaData);
    }
    return await this.menuService.create(menuData);
  }
}
```

#### 步骤 4: 修复控制器方法调用
```typescript
// 确保控制器调用的方法在适配器中存在
export class MenuController {
  // 修复前
  async getActiveMenus() {
    return await this.menuAdapterService.findActive(); // 方法不存在
  }

  // 修复后
  async getActiveMenus() {
    return await this.menuAdapterService.findByStatus(1); // 使用存在的方法
  }
}
```

### 方案 2: 简化实现（快速解决）

如果时间紧迫，可以采用简化的适配器实现：

```typescript
@Injectable()
export class MenuAdapterService {
  constructor(
    private ormFactory: OrmFactoryService,
    private menuService: MenuService,
    // 暂时不使用 Prisma 服务
  ) {}

  // 所有方法都委托给 TypeORM 服务
  async findAll() {
    return await this.menuService.findAll();
  }

  async findOne(id: number) {
    return await this.menuService.findOne(id);
  }

  // ... 其他方法类似
}
```

## 📝 实施建议

### 优先级排序
1. **高优先级**: Book, User (已完成)
2. **中优先级**: Menu, Role (核心功能)
3. **低优先级**: Contents (辅助功能)

### 实施步骤
1. 先修复 Prisma Schema，重新生成客户端
2. 为现有 TypeORM 服务添加缺失方法
3. 修复适配器服务的类型问题
4. 更新控制器以使用适配器服务
5. 测试双 ORM 切换功能

### 测试策略
```typescript
// 创建测试脚本验证适配器功能
describe('MenuAdapterService', () => {
  it('should work with TypeORM', async () => {
    // 设置 ORM_TYPE=typeorm
    const result = await menuAdapterService.findAll();
    expect(result).toBeDefined();
  });

  it('should work with Prisma', async () => {
    // 设置 ORM_TYPE=prisma
    const result = await menuAdapterService.findAll();
    expect(result).toBeDefined();
  });
});
```

## 🚀 下一步行动

1. **立即行动**: 修复 Prisma Schema 并重新生成客户端
2. **短期目标**: 完成 Menu 和 Role 模块的适配器实现
3. **长期目标**: 实现完整的双 ORM 支持和自动切换

## 📚 参考资料

- [NestJS 适配器模式](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)
- [Prisma Schema 参考](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [TypeORM 实体参考](https://typeorm.io/entities)

---

**注意**: 当前的实现存在较多类型不匹配问题，建议采用渐进式修复方案，优先解决核心模块的适配器实现。
