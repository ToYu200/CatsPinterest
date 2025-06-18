import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async newUser(@Body() body, @Res() res: Response) {
    const { user, token } = await this.userService.create(body.login, body.password);
    res.setHeader('X-Auth-Token', token);
    return res.json(user);
  }
}
