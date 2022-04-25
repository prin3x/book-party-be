import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAuthPayload } from 'auth/auth.decorator';
import { Repository } from 'typeorm';
import { CreateNotificationDTO } from './dto/create-notification';
import {
  INotificationOperation,
  NotificationQueryParamsDTO,
} from './dto/find-notication.dto';
import { Notification, NOTI_TABLE } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDTO,
    authPayload: IAuthPayload,
  ) {
    this.logger.log(`fn => ${this.create.name}, for => ${authPayload.id}`);
    let res: Notification;

    const noti = new Notification();
    noti.content = createNotificationDto.content;
    noti.destination = createNotificationDto.destination;
    noti.for = createNotificationDto.for;

    try {
      res = await this.repo.save(noti);
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException(e);
    }

    return res;
  }

  async findAll(
    opt: INotificationOperation,
    authPayload: IAuthPayload,
  ): Promise<Notification[]> {
    this.logger.log(`fn => ${this.findAll.name}, By: ${authPayload.id}`);
    let res: Notification[];
    try {
      const query = this.repo
        .createQueryBuilder(NOTI_TABLE)
        .where(`${NOTI_TABLE}.for Like :userId`, {
          userId: `${authPayload.id}`,
        });

      if (opt.type) {
        query.andWhere(`${NOTI_TABLE}.type Like :type`, {
          type: `%${opt.type}%`,
        });
      }

      query.orderBy(`${NOTI_TABLE}.createdDate`, 'DESC');
      query.skip(opt.skip).take(opt.limit);

      res = await query.getMany();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Error Query');
    }

    return res;
  }

  parseQueryString(q: NotificationQueryParamsDTO): INotificationOperation {
    const rtn: INotificationOperation = {
      page: +q?.page || 1,
      limit: +q?.limit ? (+q?.limit > 100 ? 100 : +q?.limit) : 5,
      skip: (q?.page - 1) * q?.limit,
      orderBy: q?.orderBy || 'id',
      order: 'ASC',
      search: q?.search ? q?.search.trim() : '',
      type: q?.type || '',
      content: q?.content || '',
    };

    q.order = q?.order ? q?.order.toUpperCase() : '';
    rtn.order = q?.order != 'ASC' && q?.order != 'DESC' ? 'DESC' : q?.order;
    rtn.skip = (rtn.page - 1) * rtn.limit;

    return rtn;
  }
}
