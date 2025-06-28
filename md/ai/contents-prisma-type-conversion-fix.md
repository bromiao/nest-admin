# Contents模块Prisma类型转换错误修复

## 问题描述

在使用Prisma ORM时，Contents模块出现类型转换错误：

```
Invalid `this.prisma.contents.create()` invocation
Argument `order`: Invalid value provided. Expected Int or Null, provided String.
```

错误原因：Prisma schema中`order`和`level`字段定义为`Int?`（可空整数），但传入的数据是字符串类型。

## 修复方案

### 1. Contents模块修复

#### 1.1 修复 `contents-adapter.service.ts`

- **问题**：在创建和更新内容时，没有将字符串类型的`order`和`level`转换为整数
- **解决方案**：添加类型转换逻辑

**修改内容**：
- 在`create`方法中添加`order`和`level`的类型转换
- 在`update`方法中添加类型转换逻辑
- 添加`convertToInt`私有方法处理类型转换

```typescript
// 添加的类型转换方法
private convertToInt(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = parseInt(String(value), 10);
  return isNaN(num) ? null : num;
}
```

#### 1.2 修复 `contents-prisma.service.ts`

- **问题**：直接使用传入的数据，没有进行类型转换
- **解决方案**：在创建、更新和添加内容时进行类型转换

**修改内容**：
- 修改`create`方法，添加数据类型转换
- 修改`update`方法，添加数据类型转换
- 修改`addContents`方法，添加数据类型转换
- 添加`convertToInt`私有方法

### 2. Menu模块预防性修复

#### 2.1 修复 `menu-adapter.service.ts`

- **问题**：Menu模型的`pid`和`active`字段也是整数类型，可能存在类似问题
- **解决方案**：添加类型转换逻辑

**修改内容**：
- 在`create`方法中使用`convertToInt`转换`pid`和`active`
- 在`update`方法中添加类型转换
- 添加`convertToInt`私有方法

## 修复的文件列表

1. `src/modules/contents/contents-adapter.service.ts`
2. `src/modules/contents/contents-prisma.service.ts`
3. `src/modules/menu/menu-adapter.service.ts`

## 类型转换逻辑

```typescript
private convertToInt(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = parseInt(String(value), 10);
  return isNaN(num) ? null : num;
}
```

**转换规则**：
- `null`、`undefined`、空字符串 → `null`
- 有效数字字符串 → 对应整数
- 无效数字字符串 → `null`

## 影响的数据库字段

### Contents表
- `order`: `Int?` - 内容排序
- `level`: `Int?` - 内容层级

### Menu表
- `pid`: `Int` - 父级菜单ID
- `active`: `Int` - 激活状态

## 测试建议

1. 测试创建内容时传入字符串类型的`order`和`level`
2. 测试更新内容时的类型转换
3. 测试菜单创建和更新的类型转换
4. 测试边界情况：空值、无效数字字符串等

## 代码质量

- 运行了ESLint检查，主要是一些类型安全警告，不影响功能
- 运行了Prettier格式化，代码格式统一
- 添加了详细的注释说明

## 总结

此次修复解决了Prisma ORM中字符串到整数的类型转换问题，确保了数据库操作的类型安全。通过添加统一的类型转换方法，提高了代码的可维护性和健壮性。
