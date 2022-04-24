import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAuthPayload } from 'auth/auth.decorator';
import { ICloundModel } from 'cloudinary/cloudinary.interface';
import { CloudinaryService } from 'cloudinary/cloudinary.service';
import { CancelJoinEventDTO } from 'join/dto/cancel-join.dto';
import { JoinEventDTO } from 'join/dto/join-event.dto';
import { EJoinStatus, JOIN_TABLE } from 'join/entities/join.entity';
import { Repository } from 'typeorm';
import { User, USER_TABLE } from 'user/entities/user.entity';
import { CreatePartyDTO } from './dto/create-party.dto';
import { IPartyOperation, PartyQueryParamsDTO } from './dto/find-party.dto';
import { EPartyStatus, Party } from './entities/party.entity';

export const PARTY_TABLE = 'party';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party) private repo: Repository<Party>,
    private cloudinary: CloudinaryService,
  ) {}

  async findWithRelations() {
    return this.repo.find({ relations: ['joinDetail'] });
  }

  async findAll(opt: IPartyOperation, authPayload: IAuthPayload) {
    let res;
    let items;
    try {
      const query = this.repo
        .createQueryBuilder(PARTY_TABLE)
        .leftJoinAndSelect(`${PARTY_TABLE}.userDetail`, `${USER_TABLE}`)
        .leftJoinAndSelect(`${PARTY_TABLE}.joinDetail`, `${JOIN_TABLE}`)
        .where(`${PARTY_TABLE}.title Like :search`, {
          search: `%${opt.search}%`,
        });

      if (opt.startDate) {
        query.andWhere(`${PARTY_TABLE}.startDate > :startDate`, {
          startDate: opt.startDate,
        });
      }

      query.orderBy(`${PARTY_TABLE}.createdDate`, 'ASC');
      query.skip(opt.skip).take(opt.limit);

      res = await query.getManyAndCount();
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error Query');
    }

    items = res?.[0];

    if (items?.[0]) {
      items = items.map((_item) => {
        const isOwner = _item.createdBy === authPayload.id;
        const isJoined = _item.joinDetail.some(
          (_el) =>
            _el.userId === authPayload.id &&
            _el.status !== EJoinStatus.DISABLED
        );
        _item.isJoined = isJoined ? true : false;
        _item.isOwner = isOwner ? true : false;

        return _item;
      });
    }

    const rtn = {
      items,
      itemCount: res?.[0]?.length,
      total: res?.[1],
      page: opt.page || 1,
    };

    return rtn;
  }

  async create(createPartyDto: CreatePartyDTO) {
    let res;
    let imageUploadResult;

    try {
      imageUploadResult = await this.uploadImageToCloudinary(
        createPartyDto.file,
      );

      const set = new Party();
      set.title = createPartyDto.title;
      set.status = EPartyStatus.ENABLED;
      set.capacity = createPartyDto.capacity;
      set.description = createPartyDto.description;
      set.startDate = createPartyDto.startDate;
      set.duration = createPartyDto.duration;
      set.coverImage = imageUploadResult.url;
      set.createdBy = createPartyDto.createdById;
      set.updatedBy = createPartyDto.updatedById;

      res = this.repo.save(set);
    } catch (error) {
      throw new BadRequestException('Unable to create event');
    }

    return res;
  }

  async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<ICloundModel> {
    let res: ICloundModel = {} as ICloundModel;
    try {
      res = await this.cloudinary.uploadImage(file);
    } catch (e) {
      throw new BadRequestException('Invalid file type.');
    }
    return res;
  }

  async findActiveOne(_id: number): Promise<Party> {
    return await this.repo.findOne(_id, {
      where: { status: EPartyStatus.ENABLED },
    });
  }

  async joinParty(
    joinDetail: JoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Party> {
    let res;
    let targetParty: Party;

    try {
      targetParty = await this.findActiveOne(joinDetail.partyId);
      if (!targetParty)
        throw new BadRequestException('Cannot find event with this ID');

      if (targetParty.createdBy === authPayload.id)
        throw new BadRequestException('Cannot join self hosted party');

      targetParty.joined += Number(joinDetail.totalGuest);

      res = await this.repo.save(targetParty);
    } catch (e) {
      throw new BadRequestException('Unable to process join');
    }

    return res;
  }

  async cancelJoinParty(
    joinDetail: CancelJoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Party> {
    let res;
    let targetParty: Party;

    try {
      targetParty = await this.findActiveOne(joinDetail.partyId);
      if (!targetParty)
        throw new BadRequestException('Cannot find event with this ID');

      if (targetParty.createdBy === authPayload.id)
        throw new BadRequestException('Cannot join self hosted party');

      targetParty.joined -= Number(joinDetail.totalGuest);

      res = await this.repo.save(targetParty);
    } catch (e) {
      throw new BadRequestException('Unable to process join');
    }

    return res;
  }

  parseQueryString(q: PartyQueryParamsDTO): IPartyOperation {
    const rtn: IPartyOperation = {
      page: +q?.page || 1,
      limit: +q?.limit ? (+q?.limit > 100 ? 100 : +q?.limit) : 9,
      skip: (q?.page - 1) * q?.limit,
      orderBy: q?.orderBy || 'id',
      order: 'ASC',
      search: q?.search ? q?.search.trim() : '',
      startDate: q.startDate,
    };

    q.order = q?.order ? q?.order.toUpperCase() : '';
    rtn.order = q?.order != 'ASC' && q?.order != 'DESC' ? 'DESC' : q?.order;
    rtn.skip = (rtn.page - 1) * rtn.limit;

    return rtn;
  }
}
