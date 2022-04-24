import { Join } from 'join/entities/join.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'user/entities/user.entity';

export enum EPartyStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  DELETED = 'deleted',
  ONHOLD = 'onhold',
}

@Entity()
export class Party {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coverImage: string;

  @Column()
  title: string;

  @Column()
  capacity: number;

  @Column()
  description: string;

  @Column()
  status: EPartyStatus;

  @Column()
  startDate: Date;

  @Column()
  duration: number;

  @Column({ default: 0 })
  joined: number;

  @Column({nullable: true})
  joinedBy: number;

  @Column()
  createdBy: number;

  @Column()
  updatedBy: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'createdBy' })
  userDetail: User;

  @OneToMany(() => Join, (_joinEntity) => _joinEntity.partyDetail)
  joinDetail: Join[];
}


