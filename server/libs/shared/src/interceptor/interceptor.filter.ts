import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class InterceptorFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {}
}
