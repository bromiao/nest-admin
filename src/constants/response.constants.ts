/**
 * API响应状态码常量
 * 统一定义项目中使用的状态码
 */

/**
 * 成功状态码
 */
export const SUCCESS_CODE = 0;

/**
 * 通用错误状态码
 */
export const ERROR_CODE = -1;

/**
 * 具体错误状态码
 */
export const ERROR_CODES = {
  // 通用错误
  UNKNOWN_ERROR: -1,
  INVALID_PARAMS: -2,
  PERMISSION_DENIED: -3,

  // 用户相关错误
  USER_NOT_FOUND: -1001,
  USER_ALREADY_EXISTS: -1002,
  INVALID_CREDENTIALS: -1003,
  USER_DISABLED: -1004,

  // 认证相关错误
  TOKEN_EXPIRED: -2001,
  TOKEN_INVALID: -2002,
  UNAUTHORIZED: -2003,

  // 资源相关错误
  RESOURCE_NOT_FOUND: -3001,
  RESOURCE_ALREADY_EXISTS: -3002,
  RESOURCE_CONFLICT: -3003,

  // 缓存相关错误
  CACHE_ERROR: -4001,
  REDIS_DISABLED: -4002,
  REDIS_CONNECTION_ERROR: -4003,

  // 数据库相关错误
  DATABASE_ERROR: -5001,
  QUERY_ERROR: -5002,

  // 文件相关错误
  FILE_NOT_FOUND: -6001,
  FILE_UPLOAD_ERROR: -6002,
  FILE_TYPE_ERROR: -6003,
} as const;

/**
 * 错误消息映射
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误',
  [ERROR_CODES.INVALID_PARAMS]: '参数错误',
  [ERROR_CODES.PERMISSION_DENIED]: '权限不足',

  [ERROR_CODES.USER_NOT_FOUND]: '用户不存在',
  [ERROR_CODES.USER_ALREADY_EXISTS]: '用户已存在',
  [ERROR_CODES.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ERROR_CODES.USER_DISABLED]: '用户已被禁用',

  [ERROR_CODES.TOKEN_EXPIRED]: '令牌已过期',
  [ERROR_CODES.TOKEN_INVALID]: '令牌无效',
  [ERROR_CODES.UNAUTHORIZED]: '未授权访问',

  [ERROR_CODES.RESOURCE_NOT_FOUND]: '资源不存在',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ERROR_CODES.RESOURCE_CONFLICT]: '资源冲突',

  [ERROR_CODES.CACHE_ERROR]: '缓存错误',
  [ERROR_CODES.REDIS_DISABLED]: 'Redis已禁用',
  [ERROR_CODES.REDIS_CONNECTION_ERROR]: 'Redis连接错误',

  [ERROR_CODES.DATABASE_ERROR]: '数据库错误',
  [ERROR_CODES.QUERY_ERROR]: '查询错误',

  [ERROR_CODES.FILE_NOT_FOUND]: '文件不存在',
  [ERROR_CODES.FILE_UPLOAD_ERROR]: '文件上传失败',
  [ERROR_CODES.FILE_TYPE_ERROR]: '文件类型错误',
} as const;

/**
 * 响应类型定义
 */
export interface ApiResponse<T = any> {
  code: number;
  data?: T;
  message: string;
  timestamp?: string;
}

/**
 * 分页响应类型定义
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  count: number;
  page?: number;
  pageSize?: number;
  total?: number;
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = '操作成功',
): ApiResponse<T> {
  return {
    code: SUCCESS_CODE,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: number = ERROR_CODE,
  message?: string,
): ApiResponse<null> {
  return {
    code,
    data: null,
    message: message || ERROR_MESSAGES[code] || '操作失败',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建分页成功响应
 */
export function createPaginatedResponse<T>(
  data: T,
  count: number,
  message: string = '获取数据成功',
  page?: number,
  pageSize?: number,
): PaginatedResponse<T> {
  return {
    code: SUCCESS_CODE,
    data,
    count,
    message,
    page,
    pageSize,
    total: count,
    timestamp: new Date().toISOString(),
  };
}
