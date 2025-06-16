import * as fs from 'node:fs';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerConfig } from './utils/common';

const dir = process.cwd();
const httpsOptions = {
  key: fs.readFileSync(path.resolve(dir, './https/localhost+2-key.pem')),
  cert: fs.readFileSync(path.resolve(dir, './https/localhost+2.pem')),
};

async function bootstrap() {
  const httpsApp = await NestFactory.create(AppModule, {
    cors: true,
    httpsOptions,
  });
  const port = getServerConfig().APP_PORT ?? 3000;
  await httpsApp.listen(+port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
