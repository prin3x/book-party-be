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
import { JwtAuthGuard } from './jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  userLogin(@Body() user) {
    return this.authService.login(user);
  }

  @Post('/register')
  userRegister(@Body() user) {
    return this.authService.register(user);
  }

  @Get('/checkauth')
  @UseGuards(JwtAuthGuard)
  checkAuthUser(@AuthPayload() user) {
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
