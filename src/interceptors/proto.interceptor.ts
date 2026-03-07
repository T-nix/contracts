import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

function stripProtoMeta(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripProtoMeta);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = stripProtoMeta(obj[key]);
      }
      return acc;
    }, {} as any);
  }

  return obj;
}

@Injectable()
export class GrpcSanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => stripProtoMeta(data)));
  }
}