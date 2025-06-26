import { PrismaClient } from '@prisma/client';
import * as md5 from 'md5';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据...');

  // 创建默认管理员用户
  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: md5('123456').toUpperCase(),
      avatar: 'https://example.com/avatar.png',
      role: 'admin',
      nickname: '系统管理员',
      active: 1,
    },
  });

  console.log('创建管理员用户:', adminUser);

  // 创建示例角色
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin', // 角色名称
      remark: '管理员角色', // 角色描述
    },
  });

  console.log('创建管理员角色:', adminRole);

  console.log('种子数据创建完成!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
