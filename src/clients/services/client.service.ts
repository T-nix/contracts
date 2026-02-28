import {
  Injectable,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { getServiceConfig, ProtoKey } from '../../proto';
import { ConfigService } from '@nestjs/config';
import { AbstractGrpcClient } from './abstract.grpc.client';


export function createGrpcClient<T extends Record<string, any>>(
  clientGrpc: ClientGrpc,
  serviceName: string,
): AbstractGrpcClient<T> {
  return new (class extends AbstractGrpcClient<T> {
    constructor() {
      super(clientGrpc, serviceName);
    }
  })();
}