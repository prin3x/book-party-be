import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}o
  async create(user: CreateUserDto)  {
    this.logger.log(
      `fn => ${this.create.name}, username: ${user.username}`,
    );
    let payload: string = '';
    let res;
    try {
      const hash = await bcrypt.hash(
        user.password,
        +this.configService.get<string>('jwt.saltRound'),
      );
      const set = {} as any;
      set.username = user.username;
      set.password = hash;
      set.provider = 'standard';
      res = await this.repo.save(set);

      payload = await this.jwtService.sign(
        { username: user.username, id: res.id },
        { privateKey: this.configService.get<string>('jwt.jwtSecret') },
      );

      return payload;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Please try again');
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return await this.repo.findOne(id);
  }

  async login(user) {
    let targetUser;
    try {
      targetUser = await this.findOneByUsername(user.username);

      if (!targetUser) return false;

      const isMatch = await bcrypt.compare(user.password, targetUser.password);

      if (isMatch) return true;

      return false;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findOneByUsername(username: string) {
    return await this.repo.findOne({
      where: {
        username,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
