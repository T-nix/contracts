import { ConfigService } from "@nestjs/config"
import { PROTO_PATHS, ProtoKey, ServiceNames } from "./paths"

export interface ServiceConfig {
    file: string,
    url: string,
    packageVersion: string,
    serviceName: ServiceNames[],
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