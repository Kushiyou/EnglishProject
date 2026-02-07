import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { ResponseService } from '@libs/shared';
import { PrismaService } from '@libs/shared';

@Injectable()
export class UserService {
  constructor(private readonly PrismaService:PrismaService,private readonly responseService: ResponseService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const data = await this.PrismaService.user.findMany();
    return this.responseService.success(data);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
