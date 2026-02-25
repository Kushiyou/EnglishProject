import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor.interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { config } from '@en/config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.setGlobalPrefix('ai');//全局路由前缀
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });//启用版本控制
  app.useGlobalFilters(new InterceptorExceptionFilter());
  await app.listen(config.ports.ai);
}
bootstrap();
