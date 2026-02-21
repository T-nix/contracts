import { ArgumentsHost, Catch, HttpException, HttpStatus, type ExceptionFilter } from "@nestjs/common";
import { grpcToHttpStatus } from "./grpc-to-http-status";
import { Response } from 'express'

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        console.log('Filter: ', exception)
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        if (this.isGrpcError(exception)) {
            const httpStatus = grpcToHttpStatus[exception.code] || 500

            return response.status(httpStatus).json({
                statusCode: httpStatus,
                message: exception.details || 'gRpc internal error'
            })
        }

        if ( exception instanceof HttpException) {
            const httpStatus = exception.getStatus()
            return response.status(httpStatus).json({
                statusCode: httpStatus,
                message: exception.message || 'gRpc internal server error'
            })
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error'
            })
    }

    private isGrpcError(exception: any) {
        return (
            typeof exception === 'object' && 
            'code' in exception && 
            'details' in exception
        )
    }
}