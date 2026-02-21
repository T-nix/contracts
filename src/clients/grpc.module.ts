import { type DynamicModule, Module } from "@nestjs/common";
import { GrpcClientFactory } from "./factory/grpc.client.factory";
import { GRPC_CLIENT_PREFIX } from "./constants/grpc.const";
import { ConfigService } from "@nestjs/config";
import { getServiceConfig, ProtoKey } from "../proto";

@Module({})
export class GrpcModule {
    public static register(clients: ProtoKey[]): DynamicModule {
        return {
            module: GrpcModule,
            providers: [
                GrpcClientFactory,
                ...clients.map((token) => {
                   
                    return {
                        provide: `${GRPC_CLIENT_PREFIX}_${token}`,
                        useFactory: (factory: GrpcClientFactory, config: ConfigService) => {
                            const cnf = getServiceConfig(token, config)

                            const client = factory.createClient({
                                package: cnf.packageVersion,
                                protoPath: cnf.file,
                                url: cnf.url
                            })
                            factory.register(token, client)

                            return client
                        },
                        inject: [GrpcClientFactory, ConfigService]
                    }
                })
            ],
            exports: [GrpcClientFactory, ...clients.map(token => `${GRPC_CLIENT_PREFIX}_${token}`)]
        }
    }
}