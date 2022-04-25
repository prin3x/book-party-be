import { Join } from 'join/entities/join.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const USER_TABLE = 'user';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 20 })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'int', default: 0.1 })
  acceptVersion: number;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  provider: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => Join, (_joinEntity) => _joinEntity.userId)
  joinDetail: Join[];
}
