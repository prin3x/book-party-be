import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async validateUser(id): Promise<any> {
    const user = await this.userService.findOne(id);
    if (user) {
      //   const { ...result } = user;
      //   return result;
    }
    return null;
  }

  async register(user: any) {
    let payload;
    try {
      const existingUsername = await this.userService.findOneByUsername(
        user.username,
      );

      if (existingUsername) throw new NotAcceptableException('Duplicated Id');

      payload = await this.userService.create(user);
    } catch (e) {
      throw new UnauthorizedException('Unable to register');
    }
    return { accessToken: payload };
  }

  async login(user: any) {
    let payload: any;
    try {
      await this.userService.login(user);
      payload = { username: user.username, sub: user.userId };
    } catch (e) {
      throw new UnauthorizedException('Unable to login');
    }
    return {
      access_token: this.jwtService.sign(payload, {
        privateKey: this.configService.get<string>('jwt.jwtSecret'),
      }),
    };
  }
}
