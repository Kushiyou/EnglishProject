import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly minioClient: Minio.Client;
    constructor(private readonly configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,//从环境变量中获取 MinIO 的连接信息
            port: Number(this.configService.get<number>('MINIO_PORT')),//从环境变量中获取 MinIO 的连接信息
            useSSL: !!Number(this.configService.get<boolean>('MINIO_USE_SSL')),//从环境变量中获取 MinIO 的连接信息
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,//从环境变量中获取 MinIO 的连接信息
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,//从环境变量中获取 MinIO 的连接信息
        })
    }
    
    //nestjs 模块初始化时会调用 onModuleInit 方法，在这里我们确保 MinIO 桶存在，如果不存在则创建它
    async onModuleInit() {
        //获取桶名
        const bucket = this.configService.get<string>('MINIO_BUCKET')!;
        //判断桶是否存在，如果不存在则创建它
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
            await this.minioClient.makeBucket(bucket);
            //设置桶的访问权限为公共读
            await this.minioClient.setBucketPolicy(bucket, JSON.stringify({
                "Version": "2012-10-17", //策略语言版本版本 类似于http版本 例如http1.1 http2.0 这个值固定即可
                "Statement": [
                    {
                        "Sid": "PublicReadObjects", //给这个规则起一个名字
                        "Effect": "Allow", //允许打开这个规则 Allow 允许 Deny 拒绝
                        "Principal": "*",//所有人
                        "Action": ["s3:GetObject"], //允许浏览器获取对象
                        "Resource": ["arn:aws:s3:::avatar/*"] //允许读取 avatar桶内的所有资源
                    }
                ]
            }))
        }
    }

    //获取minio客户端
    getClient() {
        return this.minioClient;
    }
    //获取minio桶名
    getBucket() {
        return this.configService.get<string>('MINIO_BUCKET')!;
    }
}
