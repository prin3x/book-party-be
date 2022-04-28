import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PartyService } from 'party/party.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(EventsGateway.name);
  constructor(private partyService: PartyService) {}
  private onlineUsers = {};

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: any) {
    delete this.onlineUsers[client.handshake.query.userId];
    // console.log('Gateway Disconnect...');
  }
  handleConnection(client: Socket, query) {
    this.logger.verbose(
      'Connecting...',
      client.id,
      'userId :',
      client.handshake.query.userId,
    );

    let newUser = {
      [client.handshake.query.userId.toString()]: client.id,
    };

    this.onlineUsers = {...this.onlineUsers, ...newUser}

    this.logger.debug(this.onlineUsers)

  }

  @SubscribeMessage('userJoinParty')
  async onJoinParty(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<number> {
    this.logger.log(data);

    this.logger.debug(this.onlineUsers[data.creatorId.toString()]);

    client
      .to(this.onlineUsers[data.creatorId.toString()])
      .emit('userJoinYourParty', data.partyId);

    return data;
  }
}
