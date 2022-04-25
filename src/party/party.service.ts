import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { UpdatePartyDTO } from './dto/update-party.dto';
import { EPartyStatus, Party } from './entities/party.entity';
import { compareAsc } from 'date-fns';

export const PARTY_TABLE = 'party';

@Injectable()
export class PartyService {
  private readonly logger = new Logger(PartyService.name);
  constructor(
    @InjectRepository(Party) private repo: Repository<Party>,
    private cloudinary: CloudinaryService,
  ) {}

  async findWithRelations() {
    return this.repo.find({ relations: ['joinDetail'] });
  }

  async findOneByIdFromOwner(id: string, authPayload: IAuthPayload) {
    let res;
    let item;

    try {
      item = await this.repo.findOne(id, {
        relations: ['joinDetail'],
        where: { status: EPartyStatus.ENABLED },
      });
      if (!item) throw new BadRequestException('ID is not recognized');

      item.isJoined = item.joinDetail.some(
        (_el) =>
          _el.userId === authPayload.id && _el.status !== EJoinStatus.DISABLED,
      );
      item.isOwner = item.createdBy === authPayload.id;

      if (!item.isOwner) throw new BadRequestException('Unauthorized access');

      res = item;
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('Unable to find this party');
    }
    return res;
  }

  async findAll(opt: IPartyOperation, authPayload: IAuthPayload) {
    this.logger.log(`fn => ${this.findAll.name}, By: ${authPayload.id}`);
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

      query.orderBy(`${PARTY_TABLE}.createdDate`, 'DESC');
      query.skip(opt.skip).take(opt.limit);

      res = await query.getManyAndCount();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Error Query');
    }

    items = res?.[0];

    if (items?.[0]) {
      items = items.map((_item) => {
        const isOwner = _item.createdBy === authPayload.id;
        const isJoined = _item.joinDetail.some(
          (_el) =>
            _el.userId === authPayload.id &&
            _el.status !== EJoinStatus.DISABLED,
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

  async create(createPartyDto: CreatePartyDTO, authPayload: IAuthPayload) {
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
      set.createdBy = authPayload.id;
      set.updatedBy = authPayload.id;

      res = this.repo.save(set);
    } catch (error) {
      throw new BadRequestException('Unable to create event');
    }

    return res;
  }

  async update(updatePartyDto: UpdatePartyDTO, authPayload: IAuthPayload) {
    let res;
    let imageUploadResult;
    let targetParty: Party;

    try {
      targetParty = await this.findOneByIdFromOwner(
        updatePartyDto.id,
        authPayload,
      );
      if (!targetParty)
        throw new BadRequestException('Party Id is not recognized');

      if (updatePartyDto.file) {
        imageUploadResult = await this.uploadImageToCloudinary(
          updatePartyDto.file,
        );
      }

      targetParty.title = updatePartyDto.title;
      targetParty.status = EPartyStatus.ENABLED;
      targetParty.capacity = updatePartyDto.capacity;
      targetParty.description = updatePartyDto.description;
      targetParty.startDate = updatePartyDto.startDate;
      targetParty.duration = updatePartyDto.duration;
      targetParty.coverImage = imageUploadResult?.url || targetParty.coverImage;
      targetParty.updatedBy = authPayload.id;

      res = await this.repo.save(targetParty);
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
      this.logger.error(e);
      throw new BadRequestException('Invalid file type.');
    }
    return res;
  }

  async findActiveOne(id: number, authPayload: IAuthPayload): Promise<Party> {
    let res;
    let item;

    try {
      item = await this.repo.findOne(id, {
        relations: ['joinDetail'],
        where: { status: EPartyStatus.ENABLED },
      });
      if (!item) throw new BadRequestException('ID is not recognized');

      item.isJoined = item.joinDetail.some(
        (_el) =>
          _el.userId === authPayload.id && _el.status !== EJoinStatus.DISABLED,
      );
      item.isOwner = item.createdBy === authPayload.id;

      res = item;
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('Unable to find this party');
    }
    return res;
  }

  async joinParty(
    joinDetail: JoinEventDTO,
    authPayload: IAuthPayload,
  ): Promise<Party> {
    this.logger.log(`fn => ${this.joinParty.name}, by => ${authPayload.id}`);
    let res;
    let targetParty: Party;

    try {
      targetParty = await this.findActiveOne(joinDetail.partyId, authPayload);
      if (compareAsc(targetParty.startDate, new Date()) < 0) {
        throw new BadRequestException('This Event is our of date');
      }

      if (!targetParty)
        throw new BadRequestException('Cannot find event with this ID');

      if (targetParty.createdBy === authPayload.id)
        throw new BadRequestException('Cannot join self hosted party');

      targetParty.joined += Number(joinDetail.totalGuest);

      res = await this.repo.save(targetParty);
    } catch (e) {
      this.logger.error(e);
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
      targetParty = await this.findActiveOne(joinDetail.partyId, authPayload);
      if (!targetParty)
        throw new BadRequestException('Cannot find event with this ID');

      if (targetParty.createdBy === authPayload.id)
        throw new BadRequestException('Cannot join self hosted party');

      targetParty.joined -= Number(joinDetail.totalGuest);

      targetParty.joined = targetParty.joined <= 0 ? 0 : targetParty.joined;

      res = await this.repo.save(targetParty);
    } catch (e) {
      this.logger.error(e);
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
