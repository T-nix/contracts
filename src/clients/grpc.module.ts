import { type DynamicModule, Module } from "@nestjs/common";
import { GrpcClientFactory } from "./factory/grpc.client.factory";
import { GRPC_CLIENT_PREFIX } from "./constants/grpc.const";
import { ConfigService } from "@nestjs/config";
import { getServiceConfig, ProtoKey } from "../proto";
import * as Services from './services'
import { GrpcClientsService } from "./services/clients.service";

const providers = Object.values(Services);
@Module({})
export class GrpcModule {
    public static register(clients: ProtoKey[]): DynamicModule {
        return {
            module: GrpcModule,
            providers: [
                GrpcClientFactory,

                // register each client one by one
                /*
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
                    */
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
            exports: [GrpcClientFactory, ...clients.map(token => `${GRPC_CLIENT_PREFIX}_${token}`)]
        }
    }
}