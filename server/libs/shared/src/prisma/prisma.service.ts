import { Injectable } from '@nestjs/common';
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client';

console.log(process.env.DATABASE_URL);

const connectionString = `${process.env.DATABASE_URL}`
@Injectable()
export class PrismaService extends PrismaClient {// 继承 PrismaClient类 
    constructor() {
        // 连接数据库
        const adapter = new PrismaPg({ connectionString })
        super({ adapter })
    }
}