import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthPayload, IAuthPayload } from 'auth/auth.decorator';
import { JwtAuthGuard } from 'auth/jwt-auth-guard';
import { CreatePartyDTO } from './dto/create-party.dto';
import { PartyQueryParamsDTO } from './dto/find-party.dto';
import { UpdatePartyDTO } from './dto/update-party.dto';
import { PartyService } from './party.service';

@UseGuards(JwtAuthGuard)
@Controller('party')
export class PartyController {
  constructor(private partyService: PartyService) {}

  @Get('/all')
  async findAllPossible() {
    return await this.partyService.findWithRelations();
  }

  @Get('/single/:id')
  async findOneById(
    @Param('id') id: string,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    return await this.partyService.findOneByIdFromOwner(id, authPayload);
  }

  @Get('/')
  async findAll(
    @Query() q: PartyQueryParamsDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    const queryObj = this.partyService.parseQueryString(q);
    return await this.partyService.findAll(queryObj, authPayload);
  }

  @Get('/joined')
  async findJoinedParty(
    @Query() q: PartyQueryParamsDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    const queryObj = this.partyService.parseQueryString(q);
    return await this.partyService.findJoinedParty(queryObj, authPayload);
  }

  @Get('/owned')
  async findOwnedParty(
    @Query() q: PartyQueryParamsDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    const queryObj = this.partyService.parseQueryString(q);
    return await this.partyService.findOwnedParty(queryObj, authPayload);
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  async createParty(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPartyDTO: CreatePartyDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    createPartyDTO.file = file;

    return await this.partyService.create(createPartyDTO, authPayload);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToCloudinary(@UploadedFile() file: Express.Multer.File) {
    return await this.partyService.uploadImageToCloudinary(file);
  }

  @Patch('/update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateParty(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updatePartyDTO: CreatePartyDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    const set: UpdatePartyDTO = {...updatePartyDTO} as UpdatePartyDTO;
    if (file) {
      set.file = file;
    }
    set.id = id;

    return await this.partyService.update(set, authPayload);
  }
}
