import {
  Body,
  Controller,
  Get,
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
import { PartyService } from './party.service';

@UseGuards(JwtAuthGuard)
@Controller('party')
export class PartyController {
  constructor(private partyService: PartyService) {}

  @Get('/all')
  async findAllPossible() {
    return await this.partyService.findWithRelations();
  }

  @Get('/')
  async findAll(
    @Query() q: PartyQueryParamsDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    const queryObj = this.partyService.parseQueryString(q);
    return await this.partyService.findAll(queryObj, authPayload);
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  async createParty(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPartyDTO: CreatePartyDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ) {
    createPartyDTO.file = file;
    createPartyDTO.createdById = authPayload.id;
    createPartyDTO.updatedById = authPayload.id;

    return await this.partyService.create(createPartyDTO);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToCloudinary(@UploadedFile() file: Express.Multer.File) {
    return await this.partyService.uploadImageToCloudinary(file);
  }
}
