import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
//引入auth模块
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports:[AuthModule]//引入AuthModule，这样就能在UserService中注入AuthService了
})
export class UserModule {}
