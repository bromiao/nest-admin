import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthAdapterService } from './auth-adapter.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET_KEY } from 'src/constants/auth.constants';
import { LoggerModule } from '../logger/logger.module';
import { OrmModule } from '../orm/orm.module';

@Module({
  imports: [
    UserModule,
    LoggerModule,
    OrmModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET_KEY,
      signOptions: { expiresIn: 24 * 60 * 60 + 's' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthAdapterService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, AuthAdapterService],
})
export class AuthModule {}
