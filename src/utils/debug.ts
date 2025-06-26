/**
 * 调试工具
 * 确保在任何环境下都能输出到控制台
 */

// 保存原始的console方法
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

/**
 * 强制输出到控制台的调试函数
 * 绕过任何日志系统的拦截
 */
export const debugLog = {
  log: (...args: any[]) => {
    originalConsole.log('🔥 [DEBUG]', ...args);
    // 同时写入到 process.stdout 确保输出
    process.stdout.write(
      `🔥 [DEBUG] ${args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(' ')}\n`,
    );
  },

  warn: (...args: any[]) => {
    originalConsole.warn('⚠️ [WARN]', ...args);
    process.stderr.write(
      `⚠️ [WARN] ${args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(' ')}\n`,
    );
  },

  error: (...args: any[]) => {
    originalConsole.error('❌ [ERROR]', ...args);
    process.stderr.write(
      `❌ [ERROR] ${args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(' ')}\n`,
    );
  },

  info: (...args: any[]) => {
    originalConsole.info('ℹ️ [INFO]', ...args);
    process.stdout.write(
      `ℹ️ [INFO] ${args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(' ')}\n`,
    );
  },

  debug: (...args: any[]) => {
    originalConsole.debug('🐛 [DEBUG]', ...args);
    process.stdout.write(
      `🐛 [DEBUG] ${args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(' ')}\n`,
    );
  },

  // 带时间戳的日志
  timestamped: (...args: any[]) => {
    const timestamp = new Date().toISOString();
    originalConsole.log(`🕐 [${timestamp}]`, ...args);
    process.stdout.write(
      `🕐 [${timestamp}] ${args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(' ')}\n`,
    );
  },
};

/**
 * 全局调试函数，可以在任何地方使用
 */
(global as any).debugLog = debugLog;

export default debugLog;
