import { Party } from 'party/entities/party.entity';
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

export enum EJoinStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export const JOIN_TABLE = 'join';

@Entity()
export class Join {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: EJoinStatus.ACTIVE })
  status: EJoinStatus;

  @Column()
  userId: number;

  @Column()
  partyId: number;

  @Column({ default: 1 })
  totalGuest: number;

  @Column()
  createdBy: number;

  @Column()
  updatedBy: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => Party, (_party) => _party.joinDetail)
  @JoinColumn({ name: 'partyId' })
  partyDetail: Party;

  @ManyToOne(() => User, (user) => user.joinDetail)
  @JoinColumn({ name: 'userId' })
  userDetail: User;

  @OneToMany(() => Party, (_party) => _party.joinedBy)
  joinDetail: Party[];
}
