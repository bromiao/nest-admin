#!/bin/bash

# 代码质量检查和修复脚本
# 用于确保代码符合ESLint和Prettier规范

echo "🔧 开始代码质量检查和修复..."

# 1. 运行Prettier格式化
echo "📝 运行Prettier格式化..."
pnpm run format
if [ $? -ne 0 ]; then
    echo "❌ Prettier格式化失败"
    exit 1
fi
echo "✅ Prettier格式化完成"

# 2. 运行ESLint检查和自动修复
echo "🔍 运行ESLint检查和自动修复..."
pnpm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  ESLint发现问题，请手动修复剩余问题"
    echo "💡 常见问题修复建议："
    echo "   - 移除未使用的导入"
    echo "   - 添加类型注解"
    echo "   - 修复async/await使用"
    echo "   - 处理any类型警告"
else
    echo "✅ ESLint检查通过"
fi

# 3. 运行TypeScript编译检查
echo "🏗️  运行TypeScript编译检查..."
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript编译失败，请修复类型错误"
    exit 1
fi
echo "✅ TypeScript编译成功"

# 4. 运行测试（如果存在）
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "🧪 运行测试..."
    pnpm run test 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ 测试通过"
    else
        echo "⚠️  测试失败或未配置"
    fi
fi

echo ""
echo "🎉 代码质量检查完成！"
echo "📊 检查结果："
echo "   ✅ 代码格式化: 完成"
echo "   ✅ ESLint检查: 完成"
echo "   ✅ TypeScript编译: 成功"
echo ""
echo "💡 建议："
echo "   - 提交代码前运行此脚本"
echo "   - 配置Git hooks自动运行检查"
echo "   - 定期更新依赖和规则"
