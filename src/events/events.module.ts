import { Module } from '@nestjs/common';
import { PartyModule } from 'party/party.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [PartyModule],
  providers: [EventsGateway],
})
export class EventsModule {}