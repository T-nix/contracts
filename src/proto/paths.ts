import { ConfigService } from "@nestjs/config";
import { join } from "path";

export const PROTO_PATHS = {
    auth: {
        file: join(__dirname, '../../proto/auth.proto'),
        host: 'localhost',
        port: 50001,
        version: 'auth.v1'
    },
    permission: {
        file: join(__dirname, '../../proto/permission.proto'),
        host: 'localhost',
        port: 50002,
        version: 'auth.v1'
    },
    user: {
        file: join(__dirname, '../../proto/user.proto'),
        host: 'localhost',
        port: 50003,
        version: 'auth.v1'
    }
} as const

export type ProtoKey = keyof typeof PROTO_PATHS;
export interface ServiceConfig {
    file: string,
    url: string,
    packageVersion: string
}

export function  getServiceConfig(serviceName: ProtoKey, config: ConfigService): ServiceConfig {
    const host = config.get<string>(`grpc.${serviceName}.host}`, {infer: true}) || PROTO_PATHS[serviceName].host
    const port = config.get<string>(`grpc.${serviceName}.port}`, {infer: true}) || PROTO_PATHS[serviceName].port
    const file = config.get<string>(`grpc.${serviceName}.file}`, {infer: true}) || PROTO_PATHS[serviceName].file
    const packageVersion = config.get<string>(`grpc.${serviceName}.version}`, {infer: true}) || PROTO_PATHS[serviceName].version
    return {
        file,
        url: `${host}:${port}`,
        packageVersion
    }
}