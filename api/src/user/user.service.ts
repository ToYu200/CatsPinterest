import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as crypto from 'crypto';

const SECRET_SALT = 'your_secret_salt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(login: string, password: string) {
    const user = this.userRepository.create({ login, password });
    await this.userRepository.save(user);
    const token = crypto.createHash('sha256').update(user.id + SECRET_SALT).digest('hex');
    return { user, token };
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByLogin(login: string) {
    return this.userRepository.findOne({ where: { login } });
  }

  async findAll() {
    return this.userRepository.find();
  }
}
