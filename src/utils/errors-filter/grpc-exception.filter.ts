import { ArgumentsHost, Catch, RpcExceptionFilter, type ExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { throwError } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { RpcStatus } from "../rpc-status.enum";

@Catch()
export class GrpcExceptionFilter implements RpcExceptionFilter  {
    catch(exception: any, host: ArgumentsHost) {
        const metadata = new Metadata();
        const code = exception?.code  ?? RpcStatus.UNKNOWN
        const message = exception?.message ?? 'UNKNOWN'
        if (exception?.meta) {
            metadata.add('details', JSON.stringify(exception.meta));
        } else if (exception?.details) {
            metadata.add('details', exception?.details);
        }

        return throwError(() => ({
            code,
            message,
            metadata,
        })); 
    }
}