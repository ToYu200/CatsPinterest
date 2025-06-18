import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listLikes(@Req() req) {
    return { data: await this.likeService.findAll(req.user.id) };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async newLike(@Req() req, @Body() body) {
    return await this.likeService.create(req.user.id, body.cat_id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':cat_id')
  async dropLike(@Req() req, @Param('cat_id') catId: string) {
    return await this.likeService.remove(req.user.id, catId);
  }
}
