import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService], // 导出MinioService，使其在其他模块中可用
})
export class MinioModule {}
