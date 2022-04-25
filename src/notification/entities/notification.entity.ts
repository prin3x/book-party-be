import { Join } from 'join/entities/join.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'user/entities/user.entity';

export const NOTI_TABLE = 'notification'

export enum ENotificationStatus {
  SEEN = 1,
  UNSEEN = 0,
}

export enum ENotificationType {
  USER_JOIN_PARTY = 'user_join_party',
  PARTY_CHANGE = 'party_change',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'tinyint', default: ENotificationStatus.UNSEEN })
  status: ENotificationStatus;

  @Column({ type: 'varchar', nullable: true })
  content: string;

  @Column({default: ENotificationType.USER_JOIN_PARTY})
  type: ENotificationType;

  @Column({ type: 'varchar', nullable: true })
  destination: string;

  @Column()
  for: number

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.notificationDetail)
  @JoinColumn({ name: 'for' })
  userDetail: User;
}
