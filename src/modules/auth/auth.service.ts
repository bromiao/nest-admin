import { UserService } from './../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as md5 from 'md5';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    const md5Pwd = md5(password).toUpperCase();

    console.log('username', username, 'password', password);
    console.log('user', user, md5Pwd);

    if (user.password !== md5Pwd) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, id: user.id };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
