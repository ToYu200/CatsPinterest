import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import * as crypto from 'crypto';

const SECRET_SALT = 'your_secret_salt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('No token');
    const token = authHeader.replace('Bearer ', '');
    const users = await this.userService.findAll();
    for (const user of users) {
      const validToken = crypto.createHash('sha256').update(user.id + SECRET_SALT).digest('hex');
      if (token === validToken) {
        request.user = user;
        return true;
      }
    }
    throw new UnauthorizedException('Invalid token');
  }
}
