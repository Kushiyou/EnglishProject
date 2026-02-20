import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
//通过PrismaService连接数据库，这样就能在其他服务中注入PrismaService来操作数据库了
export class PrismaService extends PrismaClient {// 继承 PrismaClient类 
    constructor(ConfigService: ConfigService) {
        // 从环境变量中获取数据库连接字符串
        const connectionString = ConfigService.get<string>('DATABASE_URL') || '';
        console.log('数据库地址', connectionString);
        // 连接数据库
        const adapter = new PrismaPg({ connectionString })
        super({ adapter })
    }
}