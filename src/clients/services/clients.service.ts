import {
  Injectable,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { getServiceConfig, ProtoKey } from '../../proto';
import { ConfigService } from '@nestjs/config';
import { createGrpcClient, GrpcClientService } from './client.service';

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

      const service = client.getService(cnf.serviceName);
      this.services.set(token, service);
    }
  }
  get<T>(key: string): T {
    const service = this.services.get(key);

    if (!service) {
      throw new Error(`gRPC service "${key}" not registered`);
    }
    return service as T;
  }

  use<T extends Record<string, any>>(key: string): GrpcClientService<T> {
    const service = this.services.get(key);

    if (!service) {
      throw new Error(`gRPC service "${key}" not registered`);
    }
    return createGrpcClient<T>(service, key)
  }
}