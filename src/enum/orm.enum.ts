/**
 * ORM类型枚举
 * 用于配置应用使用的ORM框架
 */
export enum OrmType {
  TYPEORM = 'typeorm',
  PRISMA = 'prisma',
}

/**
 * ORM配置键枚举
 */
export enum OrmConfigEnum {
  ORM_TYPE = 'ORM_TYPE',
}
