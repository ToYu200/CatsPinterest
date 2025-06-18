import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Like } from '../like/like.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @OneToMany(() => Like, like => like.user)
  likes: Like[];
}
