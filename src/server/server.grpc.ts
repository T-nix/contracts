
import { INestApplication } from '@nestjs/common'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
import { getServiceConfig, ProtoKey } from '../proto'

export async function  buildGRPCServer(app: INestApplication, config: ConfigService): Promise<void> {
    const serviceName = config.getOrThrow<ProtoKey>("GRPC_SERVICE")
    const service = getServiceConfig(serviceName, config)

    app.connectMicroservice<MicroserviceOptions>({
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
                oneofs: true
            }
        }
    })

	await app.startAllMicroservices()

	app.init()
}