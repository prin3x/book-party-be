import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'config/configuration';
import { User } from 'user/entities/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from 'events/events.module';
import { PartyModule } from './party/party.module';
import { Party } from 'party/entities/party.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { JoinModule } from './join/join.module';
import { Join } from 'join/entities/join.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        synchronize: true,
        entities: [User, Party, Join],
      }),
    }),
    UserModule,
    AuthModule,
    EventsModule,
    PartyModule,
    CloudinaryModule,
    JoinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
