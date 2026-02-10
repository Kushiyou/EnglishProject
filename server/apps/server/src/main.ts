import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor.interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { config } from '@en/config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.setGlobalPrefix('api');//全局路由前缀
  app.enableVersioning({type:VersioningType.URI,defaultVersion:"1"});//启用版本控制
  app.useGlobalFilters(new InterceptorExceptionFilter());
  await app.listen(config.ports.server);
}
bootstrap();
