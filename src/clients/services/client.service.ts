import { ClientGrpc } from '@nestjs/microservices';
import { AbstractGrpcClient } from './abstract.grpc.client';


export function createGrpcClient<T extends Record<string, any>>(
  clientGrpc: T,
  serviceName: string,
): AbstractGrpcClient<T> {
  return new (class extends AbstractGrpcClient<T> {
    constructor() {
      super(clientGrpc, serviceName);
    }
  })();
}