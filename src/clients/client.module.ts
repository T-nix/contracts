import { DynamicModule, Module, Provider } from "@nestjs/common";
import { ClientGrpc, ClientsModule, Transport } from "@nestjs/microservices";

export interface ClientModuleOptions {
  name: string;        // CONFIG, AUTH, USER
  package: string;
}

export const GRPC_CLIENT_TOKEN = (name: string) =>
  `GRPC_CLIENT_${name}`;

export const GRPC_CLIENT_SERVICE = (name: string) =>
  `GRPC_CLIENT_SERVICE_${name}`;


@Module({})
export class GrpcClientsModule {}