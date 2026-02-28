import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { UserServiceClient } from "../../gen/user";
import { AuthServiceClient } from "../../gen/auth";

export type GrpcServices = {
  UserService: UserServiceClient,
  AuthService: AuthServiceClient,
  PermissionService: any
}

export interface GrpcClientConfig {
    file: string
    host: string
    port: number
    version: string
    serviceName: string
}

export const PROTO_PATHS: Record<string, GrpcClientConfig>= {
    auth: {
        file: join(__dirname, '../../proto/auth.proto'),
        host: 'localhost',
        port: 50001,
        version: 'auth.v1',
        serviceName: 'AuthService',
    },
    
    permission: {
        file: join(__dirname, '../../proto/permission.proto'),
        host: 'localhost',
        port: 50002,
        version: 'permission.v1',
        serviceName: 'PermissionService',
    },
    user: {
        file: join(__dirname, '../../proto/user.proto'),
        host: 'localhost',
        port: 50003,
        version: 'user.v1',
        serviceName: 'UserService',
    }
} as const

export type ProtoKey = keyof typeof PROTO_PATHS;
export interface ServiceConfig {
    file: string,
    url: string,
    packageVersion: string,
    serviceName: string,
}

export function  getServiceConfig(serviceName: ProtoKey, config: ConfigService): ServiceConfig {
    const host = config.get<string>(`grpc.${serviceName}.host}`, {infer: true}) || PROTO_PATHS[serviceName].host
    const port = config.get<string>(`grpc.${serviceName}.port}`, {infer: true}) || PROTO_PATHS[serviceName].port
    const file = config.get<string>(`grpc.${serviceName}.file}`, {infer: true}) || PROTO_PATHS[serviceName].file
    const packageVersion = config.get<string>(`grpc.${serviceName}.version}`, {infer: true}) || PROTO_PATHS[serviceName].version
    return {
        file,
        url: `${host}:${port}`,
        packageVersion,
        serviceName: PROTO_PATHS[serviceName].serviceName,
    }
}