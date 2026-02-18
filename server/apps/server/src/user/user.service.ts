import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';
import { PrismaService } from '@libs/shared';
import type { UserLogin, UserRegister } from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client';

const userSelect =  {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true,
}

@Injectable()
export class UserService {
  constructor(private readonly PrismaService:PrismaService,private readonly responseService: ResponseService) {}
  //登录--------
  async login(createUserDto: UserLogin) {
    //1.判断手机号是否存在，如果不存在则返回错误提示
    const user = await this.PrismaService.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (!user) {
      return this.responseService.error('手机号错误');
    }
    //2.如果手机号存在，则判断密码是否正确，如果密码不正确则返回错误提示
    if (user.password !== createUserDto.password) {
      return this.responseService.error('密码错误');
    }
    //3.如果手机号和密码都正确，则更新最后登录时间，并返回用户信息
    const updateUser = await this.PrismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
      select: userSelect,
    });
    return this.responseService.success(updateUser);
  } 


  //注册--------
  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(), //最后登录时间
    }
    //1.判断手机号是否存在，如果存在则返回错误提示
    const user = await this.PrismaService.user.findUnique({
      where: {
        phone: createUserDto.phone, 
      },
    });
    if (user) {
      return this.responseService.error('手机号已存在');
    }
    //2.判断用户是否传入邮箱，如果传入则判断邮箱是否存在，如果存在则返回错误提示
    if (createUserDto.email) {
      const userEmail = await this.PrismaService.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      }); 
      if (userEmail) {
        return this.responseService.error('邮箱已存在');
      }
      data.email = createUserDto.email;
    }
    //3.如果用户名和邮箱都不存在，则创建用户
    const newUser = await this.PrismaService.user.create({
      data,
      select: userSelect,
    });
    //注意newUser是包含密码的，所以在返回给前端之前需要删除密码字段
    return this.responseService.success(newUser);
  }
}
