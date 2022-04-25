import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAuthPayload } from 'auth/auth.decorator';
import { CreateNotificationDTO } from 'notification/dto/create-notification';
import { NotificationService } from 'notification/notification.service';
import { PartyService } from 'party/party.service';
import { Repository } from 'typeorm';
import { CancelJoinEventDTO } from './dto/cancel-join.dto';
import { JoinEventDTO } from './dto/join-event.dto';
import { EJoinStatus, Join } from './entities/join.entity';

@Injectable()
export class JoinService {
  private logger = new Logger(JoinService.name);
  constructor(
    @InjectRepository(Join) private repo: Repository<Join>,
    private partyService: PartyService,
    private notificationService: NotificationService,
  ) {}

  async findOneById(id: number): Promise<Join> {
    return await this.repo.findOne(id);
  }

  async findActiveByUserId(userId: number, partyId: number): Promise<Join> {
    return await this.repo.findOne({ userId, status: EJoinStatus.ACTIVE, partyId });
  }

  async joinRoom(
    joinRoomDTO: JoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Join> {
    this.logger.log(
      `fn => ${this.joinRoom.name}, params: { partyId : ${joinRoomDTO.partyId} guest: ${joinRoomDTO.totalGuest}}`,
    );
    let res;

    let set: Join = new Join();

    try {
      const targetJoin = await this.findActiveByUserId(authPayload.id, joinRoomDTO.partyId);

      if (targetJoin) {
        set.id = targetJoin.id;
      }

      set.partyId = +joinRoomDTO.partyId;
      set.totalGuest = joinRoomDTO.totalGuest;
      set.userId = authPayload.id;
      set.createdBy = authPayload.id;
      set.updatedBy = authPayload.id;

      const party = await this.partyService.joinParty(joinRoomDTO, authPayload);

      const notification: CreateNotificationDTO = {
        for: party.createdBy,
      };

      await this.notificationService.create(notification, authPayload);

      res = await this.repo.save(set);
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException(e);
    }

    return res;
  }

  async cancelJoinRoom(
    cancelRoomDTO: CancelJoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Join> {
    this.logger.log(
      `fn => ${this.cancelJoinRoom.name}, params: { partyId : ${cancelRoomDTO.partyId} guest: ${cancelRoomDTO.totalGuest}}`,
    );
    let res;
    let targetJoin: Join = new Join();

    if (!cancelRoomDTO.partyId)
      throw new BadRequestException('Please provide party ID');

    try {
      targetJoin = await this.findActiveByUserId(authPayload.id, cancelRoomDTO.partyId);

      if (!targetJoin)
        throw new BadRequestException('This join id is not recognized');

      cancelRoomDTO.totalGuest = targetJoin.totalGuest;

      await this.partyService.cancelJoinParty(cancelRoomDTO, authPayload);

      targetJoin.status = EJoinStatus.DISABLED;

      res = await this.repo.save(targetJoin);
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException(e);
    }

    return res;
  }
}
