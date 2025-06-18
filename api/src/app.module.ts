import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { Like } from './like/like.entity';
import { UserService } from './user/user.service';
import { LikeService } from './like/like.service';
import { UserController } from './user/user.controller';
import { LikeController } from './like/like.controller';
import { JwtAuthGuard } from './user/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'cat-pinterest-api-pg',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'catpinterest',
      entities: [User, Like],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Like]),
  ],
  controllers: [AppController, UserController, LikeController],
  providers: [AppService, UserService, LikeService, JwtAuthGuard],
})
export class AppModule {}
