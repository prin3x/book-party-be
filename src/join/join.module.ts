import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyModule } from 'party/party.module';
import { Join } from './entities/join.entity';
import { JoinController } from './join.controller';
import { JoinService } from './join.service';

@Module({
  imports: [TypeOrmModule.forFeature([Join]), PartyModule],
  controllers: [JoinController],
  providers: [JoinService],
})
export class JoinModule {}
