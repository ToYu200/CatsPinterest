import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { LikeService } from './like.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';

@Controller('likes')
export class LikeController {
  constructor(
    private readonly likeService: LikeService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async ensureUser1() {
    let user = await this.userRepository.findOne({ where: { id: 1 } });
    if (!user) {
      user = this.userRepository.create({ id: 1, login: 'testuser', password: 'testpass' });
      await this.userRepository.save(user);
    }
    return user;
  }

  @Get()
  async listLikes() {
    await this.ensureUser1();
    return { data: await this.likeService.findAll(1) };
  }

  @Post()
  async newLike(@Body() body) {
    await this.ensureUser1();
    return await this.likeService.create(1, body.cat_id);
  }

  @Delete(':cat_id')
  async dropLike(@Param('cat_id') catId: string) {
    await this.ensureUser1();
    return await this.likeService.remove(1, catId);
  }
}
