import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { IResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler<T>): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: '000',
        message: 'success',
        data,
      })),
    );
  }
}
