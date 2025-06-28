import { Controller, Get } from '@nestjs/common';

@Controller('test-console')
export class TestConsoleController {
  @Get()
  testConsoleLog() {
    console.log('🔥 这是一个测试 console.log 输出');
    console.warn('⚠️ 这是一个测试 console.warn 输出');
    console.error('❌ 这是一个测试 console.error 输出');
    console.info('ℹ️ 这是一个测试 console.info 输出');
    console.debug('🐛 这是一个测试 console.debug 输出');

    // 测试对象输出
    console.log('📦 对象输出测试:', {
      name: '测试对象',
      value: 123,
      nested: { a: 1, b: 2 },
    });

    return {
      message: '控制台日志测试完成，请查看终端输出',
      timestamp: new Date().toISOString(),
    };
  }
}
