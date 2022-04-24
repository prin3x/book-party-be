import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthPayload, IAuthPayload } from 'auth/auth.decorator';
import { JwtAuthGuard } from 'auth/jwt-auth-guard';
import { CancelJoinEventDTO } from './dto/cancel-join.dto';
import { JoinEventDTO } from './dto/join-event.dto';
import { JoinService } from './join.service';

@UseGuards(JwtAuthGuard)
@Controller('join')
export class JoinController {
  constructor(private joinService: JoinService) {}

  @Post('/')
  async joinRoom(
    @Body() joinDetail: JoinEventDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {

    return await this.joinService.joinRoom(joinDetail, authPayload);
  }

  @Post('/undo')
  async cancelJoinRoom(
    @Body() joinDetail: CancelJoinEventDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {

    return await this.joinService.cancelJoinRoom(joinDetail, authPayload);
  }
}
