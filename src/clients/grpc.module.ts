import { type DynamicModule, Module } from "@nestjs/common";
import { GrpcClientFactory } from "./factory/grpc.client.factory";
import { ConfigService } from "@nestjs/config";
import { getServiceConfig, ProtoKey } from "../proto";

import { GrpcClientsService } from "./services/clients.service";

@Module({})
export class GrpcModule {
    public static register(clients: ProtoKey[]): DynamicModule {
        return {
            module: GrpcModule,
            providers: [
                GrpcClientFactory,
                {
                    provide: 'GRPC_CONFIG',
                    useValue: clients,
                },
                {
                    provide: 'GRPC_CLIENTS',
                    useFactory: (factory: GrpcClientFactory, config: ConfigService) => {
                        const map: Record<string, any> = {};
                        clients.forEach((token) => {
                            const cnf = getServiceConfig(token, config)

                            const client = factory.createClient({
                                package: cnf.packageVersion,
                                protoPath: cnf.file,
                                url: cnf.url
                            })
                            factory.register(token, client)

                            map[token] = client;
                        });
                        return map;
                    },
                    inject: [GrpcClientFactory, ConfigService],
                },
               GrpcClientsService
            ],
            exports: [
                GrpcClientFactory, 
                'GRPC_CONFIG',   // <-- MUST export
                'GRPC_CLIENTS',  // <-- MUST export
                GrpcClientsService
            ]
        }
    }
}