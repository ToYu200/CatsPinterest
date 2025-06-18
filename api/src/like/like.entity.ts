import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cat_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.likes, { onDelete: 'CASCADE' })
  user: User;
}
