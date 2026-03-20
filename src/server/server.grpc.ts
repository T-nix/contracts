
import { ExceptionFilter, INestApplication, Type, DynamicModule, ForwardReference } from '@nestjs/common'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
import { getServiceConfig, ProtoKey } from '../proto'
import { NestFactory } from '@nestjs/core'
import { GrpcExceptionFilter } from '../utils'

type IEntryNestModule = Type<any> | DynamicModule | ForwardReference | Promise<IEntryNestModule>;

export type ServerOptions = {
    filers?: ExceptionFilter<any>[]
}
export async function  buildHybridGRPCServer(app: INestApplication, config: ConfigService, options?: ServerOptions): Promise<void> {
    const serviceName = config.getOrThrow<ProtoKey>("GRPC_SERVICE")
    const service = getServiceConfig(serviceName, config)
    
    const grpc = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: service.packageVersion,
            protoPath: service.file,
            url: service.url,
            loader: {
                keepCase: false,
                longs: String,
                enum: String,
                default: true,
                oneofs: false
            }
        }
    })
    if (options?.filers) {
        app.useGlobalFilters(...options.filers);
        grpc.useGlobalFilters(...options.filers);
    }
	await app.startAllMicroservices()

	app.init()
}

export async function  buildGRPCServer(AppModule: IEntryNestModule, options?: ServerOptions): Promise<void> {
	const tmpApp = await NestFactory.create(AppModule)
    const config = tmpApp.get(ConfigService)
    
    const serviceName = config.getOrThrow<ProtoKey>("GRPC_SERVICE")
    const service = getServiceConfig(serviceName, config)
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.GRPC,
        options: {
            package: service.packageVersion,
            protoPath: service.file,
            url: service.url,
            loader: {
                keepCase: false,
                longs: String,
                enum: String,
                default: true,
                oneofs: false
            }
        },
    });    
    const filter = options?.filers ? [new GrpcExceptionFilter(), ...options?.filers] : [new GrpcExceptionFilter()]
    if (filter) {
        app.useGlobalFilters(...filter)
    }
	await app.listen()
}