import {
  Injectable,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { getServiceConfig, ProtoKey } from '../../proto';
import { ConfigService } from '@nestjs/config';
import { AbstractGrpcClient } from './abstract.grpc.client';

@Injectable()
export class GrpcClientService<T> extends AbstractGrpcClient<T extends Record<string, any>> {
    constructor(
        private readonly client: ClientGrpc,
        private readonly serviceName: string
    ) {
        super(client, serviceName)
    }
}