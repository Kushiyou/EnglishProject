import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';
import { PrismaService } from '@libs/shared';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import type { UserLogin, UserRegister, Token, RefreshTokenPlayload, UserUpdate } from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import { MinioService } from '@libs/shared/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

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
  bio: true,
  isTimingTask: true,
  timingTaskTime: true,
}
const updateUserSelect = {
    name: true, //用户名
    email: true, //邮箱
    address: true, //地址
    avatar: true, //头像
    bio: true, //签名 
    isTimingTask: true, //是否开启定时任务 
    timingTaskTime: true, //定时任务时间
}

@Injectable()
export class UserService {
  constructor(
    private readonly PrismaService: PrismaService,
    private readonly responseService: ResponseService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly minioServer: MinioService,
    private readonly configService: ConfigService,
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
      return this.responseService.error(null, '手机号错误');
    }
    //2.如果手机号存在，则判断密码是否正确，如果密码不正确则返回错误提示
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null, '密码错误');
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
      return this.responseService.error(null, '手机号已存在');
    }
    //2.判断用户是否传入邮箱，如果传入则判断邮箱是否存在，如果存在则返回错误提示
    if (createUserDto.email) {
      const userEmail = await this.PrismaService.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (userEmail) {
        return this.responseService.error(null, '邮箱已存在');
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
        return this.responseService.error(null, 'refreshToken无效');
      }
      //3.查询用户是否存在
      const user = await this.PrismaService.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });
      if (!user) {
        return this.responseService.error(null, '用户不存在');
      }
      const token = this.authService.generateToken({ userId: user.id, name: user.name, email: user.email });
      return this.responseService.success(token);
    } catch (error) {
      return this.responseService.error(null, 'refreshToken无效或过期');
    }
  }

  //上传头像--------存到的地方是minio，数据库里只存储文件的路径，返回给前端的是文件的预览URL和数据库URL
  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      return this.responseService.error(null, '请上传文件...');
    }
    if (file.size > 5 * 1024 * 1024) {
      return this.responseService.error(null, '文件大小不能超过5MB');
    }
    //获取minio客户端和桶名
    const client = this.minioServer.getClient();
    const bucket = this.minioServer.getBucket();
    //资源的名称
    const fileName = `${Date.now()}-${file.originalname}`;
    //上传资源到minio
    await client.putObject(bucket,fileName,file.buffer,file.size,{
      "Content-Type": file.mimetype
    })
    //返回文件url
    const isHttps = !!Number(this.configService.get('MINIO_USE_SSL')) //是否启用SSL
    const baseUrl = isHttps ? 'https' : 'http' //前缀http
    const port = this.configService.get<string>('MINIO_PORT')! //端口9000
    const databaseUrl = `/${bucket}/${fileName}`//数据库url /avatar/1234567890-xiaomansdas.jpg
    const previewUrl = `${baseUrl}://${this.configService.get('MINIO_ENDPOINT')}:${port}${databaseUrl}`
    //previewUrl->http://192.168.1.10:9000/avatar/1234567890-xiaomansdas.jpg
    //databaseUrl->/avatar/1234567890-xiaomansdas.jpg
    return this.responseService.success({
      previewUrl,
      databaseUrl,
    });
  }

  //更新用户信息--------
  async updateUser(createUserDto: UserUpdate, user: Request['user']) {
    const updatedUser = await this.PrismaService.user.update({
      where: {
        id: user.userId,
      },
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        address: createUserDto.address,
        avatar: createUserDto.avatar,
        bio: createUserDto.bio,
        isTimingTask: createUserDto.isTimingTask,
        timingTaskTime: createUserDto.timingTaskTime,
      },
      select: updateUserSelect
    });
    return this.responseService.success(updatedUser);
  }
}
