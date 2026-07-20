import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
@Injectable() export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(data => {
      if (data === undefined || data === null) return data;
      if (data && typeof (data as any).setHeader === 'function' && typeof (data as any).end === 'function') return data;
      return JSON.parse(JSON.stringify(data, (_k, value) => typeof value === 'bigint' ? value.toString() : value));
    }));
  }
}
