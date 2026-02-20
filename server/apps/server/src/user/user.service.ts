import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';
import { PrismaService } from '@libs/shared';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import type { UserLogin, UserRegister, Token, RefreshTokenPlayload } from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client';

const userSelect = {
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
  constructor(
    private readonly PrismaService: PrismaService,
    private readonly responseService: ResponseService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }
  //登录--------
  async login(createUserDto: UserLogin) {
    //1.判断手机号是否存在，如果不存在则返回错误提示
    const user = await this.PrismaService.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (!user) {
      return this.responseService.error(null,'手机号错误');
    }
    //2.如果手机号存在，则判断密码是否正确，如果密码不正确则返回错误提示
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null,'密码错误');
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
    //4.生成token并返回给前端
    const token = this.authService.generateToken({ userId: updateUser.id, name: updateUser.name, email: updateUser.email });
    return this.responseService.success({ ...updateUser, token });
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
      return this.responseService.error(null,'手机号已存在');
    }
    //2.判断用户是否传入邮箱，如果传入则判断邮箱是否存在，如果存在则返回错误提示
    if (createUserDto.email) {
      const userEmail = await this.PrismaService.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (userEmail) {
        return this.responseService.error(null,'邮箱已存在');
      }
      data.email = createUserDto.email;
    }
    //3.如果用户名和邮箱都不存在，则创建用户
    const newUser = await this.PrismaService.user.create({
      data,
      select: userSelect,
    });
    //4.生成token并返回给前端
    const token = this.authService.generateToken({ userId: newUser.id, name: newUser.name, email: newUser.email });
    //注意newUser是包含密码的，所以在返回给前端之前需要删除密码字段
    return this.responseService.success({ ...newUser, token });
  }

  //刷新token--------
  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    try {
    //1.验证refreshToken是否有效，如果无效则返回错误提示
      const decoded = this.jwtService.verify<RefreshTokenPlayload>(createUserDto.refreshToken);
      //2.增加判断tokenType是否为refresh，如果不是则返回错误提示，如果不判断tokenType，那么accessToken也能用来刷新token，这样就失去了refreshToken的意义了 
      if (decoded.tokenType !== 'refresh') {
        //我怎么知道这个decoded是refreshToken的payload呢？
        //因为我在生成refreshToken的时候，payload里加了一个tokenType字段，值为'refresh'，而accessToken的payload里这个字段的值为'access'，所以我可以通过判断这个字段来区分是refreshToken还是accessToken
        return this.responseService.error(null,'refreshToken无效');
      }
      //3.查询用户是否存在
      const user = await this.PrismaService.user.findUnique({
        where: {
          id: decoded.userId, 
        },
      });
      if (!user) {
        return this.responseService.error(null,'用户不存在');
      }
      const token = this.authService.generateToken({ userId: user.id, name: user.name, email: user.email });
      return this.responseService.success(token);
    } catch (error) {
      return this.responseService.error(null, 'refreshToken无效或过期');
    }
  }
}
