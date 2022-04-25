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
  id: string;

  @Column({ type: 'varchar' })
  coverImage: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column()
  capacity: number;

  @Column({ type: 'varchar' })
  description: string;

  @Column()
  status: EPartyStatus;

  @Column()
  startDate: Date;

  @Column({ type: 'int' })
  duration: number;

  @Column({ default: 0 })
  joined: number;

  @Column({ nullable: true })
  joinedBy: number;

   @Column({ type: 'int' })
  createdBy: number;

   @Column({ type: 'int' })
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
