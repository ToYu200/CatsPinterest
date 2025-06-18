import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { User } from '../user/user.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(userId: number) {
    return this.likeRepository.find({ where: { user: { id: userId } } });
  }

  async create(userId: number, cat_id: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const like = this.likeRepository.create({ cat_id, user });
    return this.likeRepository.save(like);
  }

  async remove(userId: number, cat_id: string) {
    const like = await this.likeRepository.findOne({ where: { user: { id: userId }, cat_id } });
    if (!like) throw new Error('Like not found');
    return this.likeRepository.remove(like);
  }
}
