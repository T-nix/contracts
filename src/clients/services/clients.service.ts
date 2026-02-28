import {
  Injectable,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { getServiceConfig, GrpcServices, ProtoKey } from '../../proto';
import { ConfigService } from '@nestjs/config';
import { createGrpcClient } from './client.service';
import { AbstractGrpcClient } from './abstract.grpc.client';

@Injectable()
export class GrpcClientsService implements OnModuleInit {
  private services = new Map<string, any>();

  constructor(
    @Inject('GRPC_CONFIG')
    private readonly tokens: ProtoKey[],
    // dynamic clients injected here
    @Inject('GRPC_CLIENTS')
    private readonly clients: Record<string, ClientGrpc>,
    private readonly config: ConfigService
  ) {}

  onModuleInit() {
    for (const token of this.tokens) {
      const client = this.clients[token];
      const cnf = getServiceConfig(token, this.config)
      if (!client) {
        throw new Error(`gRPC client "${token}" not found`);
      }
      console.log(`Registry new client ${token}`)
      const getService = this.createGrpcGetter<GrpcServices>(client);
      this.services.set(token, getService(cnf.serviceName as keyof GrpcServices));
    }
  }

  createGrpcGetter<T extends Record<string, object>>(client: ClientGrpc) {
    return <K extends keyof T>(name: K): T[K] =>
      client.getService<T[K]>(name as string)
  }

  get<T>(key: ProtoKey): T {
    const service = this.services.get(key);

    if (!service) {
      throw new Error(`gRPC service "${key}" not registered`);
    }
    return service as T;
  }
/*
  use<T extends Record<string, any>>(key: ProtoKey): AbstractGrpcClient<T> {
    const client = this.clients[key];
    if (!client) {
      throw new Error(`gRPC service "${key}" not registered`);
    }
     
    return createGrpcClient<T>(client, key)
  }*/
}