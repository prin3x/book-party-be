import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { PartyService } from 'party/party.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(EventsGateway.name)
  constructor(private partyService: PartyService){}
  @WebSocketServer()
  server: Server;

  handleDisconnect(client: any) {
    // console.log('Gateway Disconnect...');
  }
  handleConnection(client: Socket, query) {
    // this.logger.verbose('Connecting...')
  }

  @SubscribeMessage('clientEvent')
  findAll(@MessageBody() data: any): WsResponse<string> {
    return { event: 'msgtoServer', data: 'RTers' };
  }

  @SubscribeMessage('userJoinParty')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
