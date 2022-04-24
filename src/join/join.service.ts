import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAuthPayload } from 'auth/auth.decorator';
import { PartyService } from 'party/party.service';
import { Repository } from 'typeorm';
import { CancelJoinEventDTO } from './dto/cancel-join.dto';
import { JoinEventDTO } from './dto/join-event.dto';
import { EJoinStatus, Join } from './entities/join.entity';

@Injectable()
export class JoinService {
  constructor(
    @InjectRepository(Join) private repo: Repository<Join>,
    private partyService: PartyService,
  ) {}

  async findOneById(id: number): Promise<Join> {
    return await this.repo.findOne(id);
  }

  async findActiveByUserId(userId: number): Promise<Join> {
    return await this.repo.findOne({ userId, status: EJoinStatus.ACTIVE });
  }

  async joinRoom(
    joinRoomDTO: JoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Join> {
    let res;

    const set: Join = new Join();

    set.partyId = joinRoomDTO.partyId;
    set.totalGuest = joinRoomDTO.totalGuest;
    set.userId = authPayload.id;
    set.createdBy = authPayload.id;
    set.updatedBy = authPayload.id;

    try {
      await this.partyService.joinParty(joinRoomDTO, authPayload);
      res = await this.repo.save(set);
    } catch (e) {
      throw new BadRequestException(e);
    }

    return res;
  }

  async cancelJoinRoom(
    joinRoomDTO: CancelJoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Join> {
    let res;
    let targetJoin: Join = new Join();

    if (!joinRoomDTO.partyId)
      throw new BadRequestException('Please provide party ID');

    try {
      targetJoin = await this.findActiveByUserId(authPayload.id);

      if (!targetJoin)
        throw new BadRequestException('This join id is not recognized');

      joinRoomDTO.totalGuest = targetJoin.totalGuest;

      await this.partyService.cancelJoinParty(joinRoomDTO, authPayload);

      targetJoin.status = EJoinStatus.DISABLED;

      console.log(targetJoin, 'targetJoin');

      res = await this.repo.save(targetJoin);
    } catch (e) {
      throw new BadRequestException(e);
    }

    return res;
  }
}
