import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { UserService } from 'user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async register(user: RegisterUserDTO) {
    let payload;
    try {
      const existingUsername = await this.userService.findOneByUsername(
        user.username,
      );

      if (existingUsername) throw new NotAcceptableException('Duplicated Id');

      payload = await this.userService.create(user);
    } catch (e) {
      this.logger.error(e)
      throw e;
    }
    return { access_token: payload };
  }

  async login(user: LoginUserDTO) {
    let payload: any;
    let accessToken: string;
    this.logger.log(`fn => ${this.login.name} username: ${user.username}`);
    try {
      const targetUser = await this.userService.findOneByUsername(
        user.username,
      );

      if (!targetUser)
        throw new BadRequestException(
          'Please Check Your Username And Password',
        );

      if (targetUser) {
        const isMatch: boolean = await bcrypt.compare(
          user.password,
          targetUser.password,
        );
        if (!isMatch)
          throw new BadRequestException(
            'Please Check Your Username And Password',
          );
        payload = { username: user.username, id: targetUser.id };
        accessToken = this.jwtService.sign(payload, {
          privateKey: this.configService.get<string>('jwt.jwtSecret'),
        });
      }
    } catch (e) {
      this.logger.error(e)
      throw e;
    }

    return {
      access_token: accessToken,
    };
  }
}
