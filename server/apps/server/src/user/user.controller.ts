import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import type { UserLogin, UserRegister, Token, UserUpdate } from '@en/common/user';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() createUserDto: UserLogin) {
    return this.userService.login(createUserDto);
  }
  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }
  //刷新token
  @Post('refresh-token')
  refreshToken(@Body() createUserDto: Omit<Token,'accessToken'>) {
    return this.userService.refreshToken(createUserDto);
  }
  //上传头像
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file')) // 使用 FileInterceptor 来处理文件上传，'file' 是前端上传文件时使用的字段名
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }
  //更新用户信息
  @UseGuards(AuthGuard) // 使用 AuthGuard 来保护这个路由，只有经过身份验证的用户才能访问
  @Post('update-user')
  update(@Body() createUserDto: UserUpdate, @Req() req: Request) {
    const user = req.user;//需要自定义类型，不然会在这报错：类型“Request”上不存在属性“user”
    return this.userService.updateUser(createUserDto, user);
  }
}
