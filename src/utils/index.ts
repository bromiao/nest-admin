import { ApiProperty } from '@nestjs/swagger';

/**
 * 成功响应（带计数）
 */
export class SuccessCountResponse<T> {
  @ApiProperty({ description: '状态码', example: 0 })
  code: number;

  @ApiProperty({ description: '响应数据' })
  result: T;

  @ApiProperty({ description: '消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '总数', example: 100 })
  count: number;
}

/**
 * 成功响应
 */
export class SuccessResponse<T> {
  @ApiProperty({ description: '状态码', example: 0 })
  code: number;

  @ApiProperty({ description: '响应数据' })
  result: T;

  @ApiProperty({ description: '消息', example: '操作成功' })
  message: string;
}

/**
 * 错误响应
 */
export class ErrorResponse {
  @ApiProperty({ description: '状态码', example: -1 })
  code: number;

  @ApiProperty({ description: '错误消息', example: '操作失败' })
  message: string;
}

/**
 * 返回带计数的成功响应
 * @param data 数据
 * @param count 计数
 * @param msg 消息
 * @returns 响应对象
 */
export function successCount(data, count, msg) {
  return {
    code: 0,
    result: data,
    message: msg,
    count,
  };
}

/**
 * 返回成功响应
 * @param data 数据
 * @param msg 消息
 * @returns 响应对象
 */
export function success(data, msg) {
  return {
    code: 0,
    result: data,
    message: msg,
  };
}

/**
 * 返回错误响应
 * @param msg 错误消息
 * @param code 错误码
 * @returns 响应对象
 */
export function error(msg, code = -1) {
  return {
    code,
    message: msg,
  };
}

/**
 * 包装Promise响应
 * @param p Promise对象
 * @param msg 成功消息
 * @returns 包装后的Promise
 */
export function wrapperResponse(p, msg) {
  return p
    .then((data) => success(data, msg))
    .catch((err) => error(err.message));
}

/**
 * 包装带计数的Promise响应
 * @param dataPromise 数据Promise
 * @param countPromise 计数Promise
 * @param msg 成功消息
 * @returns 包装后的Promise
 */
export function wrapperCountResponse(dataPromise, countPromise, msg) {
  return Promise.all([dataPromise, countPromise])
    .then((res) => {
      const [data, countArr] = res;
      const [count] = countArr;
      return successCount(data, count.count, msg);
    })
    .catch((err) => error(err.message));
}
