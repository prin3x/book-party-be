import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthPayload } from './auth.decorator';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { JwtAuthGuard } from './jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  userLogin(@Body() user: LoginUserDTO) {
    return this.authService.login(user);
  }

  @Post('/register')
  async userRegister(@Body() user: RegisterUserDTO) {
    return await this.authService.register(user);
  }

  @Get('/checkauth')
  @UseGuards(JwtAuthGuard)
  checkAuthUser(@AuthPayload() user) {
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
