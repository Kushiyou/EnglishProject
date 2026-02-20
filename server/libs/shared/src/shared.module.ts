import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService, PrismaModule, ResponseModule, JwtModule, ConfigModule],
  imports: [
    PrismaModule,
    ResponseModule,
    ConfigModule.forRoot({//这是配置模块，负责加载环境变量
      isGlobal: true, // 将 ConfigModule 设置为全局模块，无需在其他模块中导入
      envFilePath: '.env', //环境变量文件路径，默认为根目录下的 .env 文件
    }),
    JwtModule.registerAsync({//这是 JWT 模块，负责处理 JSON Web Tokens 的生成和验证
      imports: [ConfigModule],// 导入 ConfigModule 以便在工厂函数中使用
      inject: [ConfigService], // 注入 ConfigService 以便在工厂函数中使用
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('MY_SECRET_KEY'),//设置 JWT 的密钥，从环境变量中获取
        signOptions: { expiresIn: 10 },//  { expiresIn: '7d' } 设置 JWT 的过期时间为 7 天
      })
    })],
})
export class SharedModule { }
